/**
 * FICHA FUNCIONAL - Modelo de Dados em TypeScript
 * EMEF "Dr. Octávio Manhães de Andrade"
 * Colatina - ES
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

type Turno = 'Matutino' | 'Vespertino';

type TipoInstituicao = 'Pública' | 'Privada';

type StatusCurso = 'Concluído' | 'Em Andamento';

type TipoVinculo =
  | 'Estagiário'
  | 'DT PMC'
  | 'Localizado Provisoriamente'
  | 'Efetivo PMC'
  | 'Estatutário'
  | 'Celetista'
  | 'Efetivo SEDU';

type TipoPosGraduacao = 'Especialização' | 'Mestrado' | 'Doutorado';

type CursoEspecifico =
  | 'Creche (0 a 3 anos)'
  | 'Pré-Escola (4 e 5 anos)'
  | 'Anos Iniciais do Ensino Fundamental'
  | 'Anos Finais do Ensino Fundamental'
  | 'Ensino Médio'
  | 'Educação Especial'
  | 'Educação Ambiental'
  | 'Educação de Jovens e Adultos'
  | 'Educação do Campo'
  | 'Educação Indígena'
  | 'Gênero e diversidade sexual'
  | 'Educação em Direitos Humanos'
  | 'Educação para as relações etnorraciais e história e cultura afro-brasileira'
  | 'Outros'
  | 'Nenhum';

// ============================================
// INTERFACES
// ============================================

interface CarteiraIdentidade {
  numero: string;
  orgaoEmissor: string;
  dataExpedicao: string;
}

interface CarteiraProfissional {
  numero: string;
  serie: string;
}

interface DadosPessoais {
  nomeCompleto: string;
  dataNascimento: string;
  naturalidade: string;
  cor: string;
  cpf: string;
  carteiraIdentidade: CarteiraIdentidade;
  carteiraProfissional: CarteiraProfissional;
  tituloEleitoral: string;
  pisPasep: string;
  cargo: string;
  matriculaFuncional: string;
}

interface Filiacao {
  mae: string;
  pai: string;
}

interface EnderecoResidencial {
  rua: string;
  numero: string;
  apartamento?: string;
  bairro: string;
  cep: string;
  telefone: string;
  celular: string;
  email: string;
}

interface AreaAtuacao {
  anosIniciaisEF: boolean;
  anosFinaisEF: boolean;
  administrativo: boolean;
  turno: Turno;
  descricaoArea?: string;
}

interface ComplementoOutraEscola {
  escola: string;
  cargaHoraria: number;
}

interface SituacaoFuncional {
  tipoVinculo: TipoVinculo;
  disciplinas: string[];
  cargaHoraria: number;
  escolasDeOrigem?: string[];
  complementoOutrasEscolas?: ComplementoOutraEscola[];
}

interface CursoSuperior {
  nome: string;
  anoInicio: number;
  anoConclusao?: number;
  statusCurso: StatusCurso;
  instituicao: string;
  tipoInstituicao: TipoInstituicao;
}

interface PosGraduacao {
  tipo: TipoPosGraduacao;
  nome: string;
  anoConclusao?: number;
  status: StatusCurso;
}

interface EscolarizacaoFormacao {
  ensinoMedio: string;
  estudosAdicionais?: string;
  cursoSuperior?: CursoSuperior;
  cursoSuperiorAndamento?: CursoSuperior;
  posGraduacao: PosGraduacao[];
}

interface FormacaoContinuada {
  cursos: CursoEspecifico[];
  totalHoras: number; // Mínimo 80h em 2019
}

interface DadosEscola {
  nome: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}

// INTERFACE PRINCIPAL
interface FichaFuncional {
  ano: number;
  escola: DadosEscola;
  dadosPessoais: DadosPessoais;
  filiacao: Filiacao;
  endereco: EnderecoResidencial;
  areaAtuacao: AreaAtuacao;
  situacaoFuncional: SituacaoFuncional;
  escolarizacao: EscolarizacaoFormacao;
  formacaoContinuada: FormacaoContinuada;
  dataPreenchimento?: Date;
  assinatura?: string;
}

// ============================================
// CLASSE GERENCIADORA
// ============================================

class FichaFuncionalManager {
  private ficha: FichaFuncional;

  constructor(ficha: FichaFuncional) {
    this.ficha = ficha;
  }

  getDadosPessoais(): DadosPessoais {
    return this.ficha.dadosPessoais;
  }

  validarEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.ficha.endereco.email);
  }

  validarCPF(): boolean {
    const cpf = this.ficha.dadosPessoais.cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
  }

  calcularCargaHorariaTotal(): number {
    let total = this.ficha.situacaoFuncional.cargaHoraria;
    if (this.ficha.situacaoFuncional.complementoOutrasEscolas) {
      total += this.ficha.situacaoFuncional.complementoOutrasEscolas
        .reduce((sum, item) => sum + item.cargaHoraria, 0);
    }
    return total;
  }

  temPosGraduacao(): boolean {
    return this.ficha.escolarizacao.posGraduacao.length > 0;
  }

  listarDisciplinas(): string[] {
    return this.ficha.situacaoFuncional.disciplinas;
  }

  listarCursosContinuada(): CursoEspecifico[] {
    return this.ficha.formacaoContinuada.cursos;
  }

  exportarJSON(): string {
    return JSON.stringify(this.ficha, null, 2);
  }

  exportarCSV(): string {
    const dados: Record<string, string | number> = {
      'Nome Completo': this.ficha.dadosPessoais.nomeCompleto,
      'CPF': this.ficha.dadosPessoais.cpf,
      'Cargo': this.ficha.dadosPessoais.cargo,
      'Área de Atuação': this.ficha.areaAtuacao.descricaoArea ?? 'N/A',
      'Carga Horária Total': this.calcularCargaHorariaTotal(),
      'Turno': this.ficha.areaAtuacao.turno,
      'Email': this.ficha.endereco.email,
      'Tipo de Vínculo': this.ficha.situacaoFuncional.tipoVinculo,
      'Tem Pós-Graduação': this.temPosGraduacao() ? 'Sim' : 'Não',
    };

    const headers = Object.keys(dados).join(',');
    const values = Object.values(dados).map(v => `"${v}"`).join(',');
    return [headers, values].join('\n');
  }

  gerarRelatorioTexto(): string {
    const sf = this.ficha.situacaoFuncional;
    const dp = this.ficha.dadosPessoais;
    const esc = this.ficha.escolarizacao;
    const sep = '='.repeat(60);

    const linhas: string[] = [
      sep,
      'FICHA FUNCIONAL – RELATÓRIO',
      sep,
      `\nESCOLA: ${this.ficha.escola.nome}`,
      `Endereço: ${this.ficha.escola.endereco}, ${this.ficha.escola.numero}`,
      `          ${this.ficha.escola.bairro} – ${this.ficha.escola.cidade}/${this.ficha.escola.estado}`,
      `          CEP: ${this.ficha.escola.cep} | Tel.: ${this.ficha.escola.telefone}`,
      `\n${sep}`,
      'DADOS PESSOAIS',
      sep,
      `Nome: ${dp.nomeCompleto}`,
      `CPF: ${dp.cpf}`,
      `Data de Nascimento: ${dp.dataNascimento}`,
      `Naturalidade: ${dp.naturalidade}`,
      `Cargo: ${dp.cargo}`,
      `Matrícula: ${dp.matriculaFuncional}`,
      `Mãe: ${this.ficha.filiacao.mae}`,
      `Pai: ${this.ficha.filiacao.pai}`,
      `\n${sep}`,
      'SITUAÇÃO FUNCIONAL',
      sep,
      `Tipo de Vínculo: ${sf.tipoVinculo}`,
      `Turno: ${this.ficha.areaAtuacao.turno}`,
      `Disciplinas: ${sf.disciplinas.join(', ')}`,
      `Carga Horária Total: ${this.calcularCargaHorariaTotal()}h`,
      `\n${sep}`,
      'ESCOLARIZAÇÃO',
      sep,
      `Ensino Médio: ${esc.ensinoMedio}`,
    ];

    if (esc.cursoSuperior) {
      const cs = esc.cursoSuperior;
      linhas.push(
        `Curso Superior: ${cs.nome} (${cs.statusCurso})`,
        `Instituição: ${cs.instituicao} (${cs.tipoInstituicao})`,
        `Período: ${cs.anoInicio}${cs.anoConclusao ? ` – ${cs.anoConclusao}` : ''}`,
      );
    }

    linhas.push(
      `Pós-Graduação: ${this.temPosGraduacao() ? `Sim (${esc.posGraduacao.length} curso(s))` : 'Não'}`,
      `Cursos de Formação Continuada: ${this.ficha.formacaoContinuada.cursos.length}`,
      `Total de Horas: ${this.ficha.formacaoContinuada.totalHoras}h`,
      `\n${sep}`,
      'CONTATO',
      sep,
      `Email: ${this.ficha.endereco.email}`,
      `Telefone: ${this.ficha.endereco.telefone}`,
      `Celular: ${this.ficha.endereco.celular}`,
      sep,
    );

    return linhas.join('\n');
  }
}

// ============================================
// EXEMPLO DE INSTÂNCIA
// ============================================

const exemploFicha: FichaFuncional = {
  ano: 2026,
  escola: {
    nome: 'EMEF "Dr. Octávio Manhães de Andrade"',
    endereco: 'Rua Benjamin Costa',
    numero: '78',
    bairro: 'Sagrado Coração de Jesus',
    cidade: 'Colatina',
    estado: 'ES',
    cep: '29707-130',
    telefone: '(27) 3722-3708',
  },
  dadosPessoais: {
    nomeCompleto: 'João da Silva Santos',
    dataNascimento: '15/03/1985',
    naturalidade: 'Colatina',
    cor: 'Pardo',
    cpf: '123.456.789-10',
    carteiraIdentidade: {
      numero: '123456789',
      orgaoEmissor: 'SSP/ES',
      dataExpedicao: '20/05/2010',
    },
    carteiraProfissional: {
      numero: '987654321',
      serie: 'A',
    },
    tituloEleitoral: '111222333',
    pisPasep: '555.666.777-88',
    cargo: 'Professor',
    matriculaFuncional: 'MAT-2026-001',
  },
  filiacao: {
    mae: 'Maria da Silva Santos',
    pai: 'Carlos da Silva Santos',
  },
  endereco: {
    rua: 'Avenida Getúlio Vargas',
    numero: '500',
    apartamento: '402',
    bairro: 'Centro',
    cep: '29700-000',
    telefone: '(27) 3721-5000',
    celular: '(27) 99999-8888',
    email: 'joao.silva@email.com',
  },
  areaAtuacao: {
    anosIniciaisEF: true,
    anosFinaisEF: false,
    administrativo: false,
    descricaoArea: 'Ensino Fundamental – Anos Iniciais',
    turno: 'Matutino',
  },
  situacaoFuncional: {
    tipoVinculo: 'Efetivo PMC',
    disciplinas: ['Português', 'Matemática', 'Ciências'],
    cargaHoraria: 40,
    complementoOutrasEscolas: [
      { escola: 'EMEF Vila Nova', cargaHoraria: 10 },
    ],
  },
  escolarizacao: {
    ensinoMedio: 'Ensino Médio Completo',
    estudosAdicionais: 'Cursos de informática básica',
    cursoSuperior: {
      nome: 'Pedagogia',
      anoInicio: 2006,
      anoConclusao: 2010,
      statusCurso: 'Concluído',
      instituicao: 'Universidade Federal do Espírito Santo',
      tipoInstituicao: 'Pública',
    },
    posGraduacao: [
      {
        tipo: 'Especialização',
        nome: 'Psicopedagogia',
        anoConclusao: 2013,
        status: 'Concluído',
      },
    ],
  },
  formacaoContinuada: {
    cursos: [
      'Anos Iniciais do Ensino Fundamental',
      'Educação Especial',
      'Gênero e diversidade sexual',
    ],
    totalHoras: 120,
  },
  dataPreenchimento: new Date('2026-04-22'),
};

// ============================================
// DEMONSTRAÇÃO
// ============================================

const manager = new FichaFuncionalManager(exemploFicha);

console.log(manager.gerarRelatorioTexto());

console.log('\n📊 INFORMAÇÕES RESUMIDAS:');
console.log(`✓ Email válido: ${manager.validarEmail()}`);
console.log(`✓ CPF válido: ${manager.validarCPF()}`);
console.log(`✓ Carga horária total: ${manager.calcularCargaHorariaTotal()}h`);
console.log(`✓ Tem pós-graduação: ${manager.temPosGraduacao()}`);
console.log(`✓ Disciplinas: ${manager.listarDisciplinas().join(', ')}`);
console.log(`✓ Cursos formação continuada: ${manager.listarCursosContinuada().length}`);

console.log('\n=== EXPORTAÇÃO CSV ===');
console.log(manager.exportarCSV());

export type {
  FichaFuncional,
  DadosPessoais,
  Filiacao,
  EnderecoResidencial,
  AreaAtuacao,
  SituacaoFuncional,
  EscolarizacaoFormacao,
  FormacaoContinuada,
  CursoSuperior,
  PosGraduacao,
  TipoVinculo,
  Turno,
  CursoEspecifico,
};
export { FichaFuncionalManager };

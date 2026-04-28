"""
FICHA FUNCIONAL - Modelo de Dados em Python
EMEF "Dr. Octávio Manhães de Andrade"
Colatina - ES
"""

from dataclasses import dataclass, field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum
import json
import csv
import sys
from io import StringIO

# Garante saída UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ============================================
# ENUMS
# ============================================

class TipoVinculo(Enum):
    """Tipos de vínculo funcional"""
    ESTAGIARIO = "Estagiário"
    DT_PMC = "DT PMC"
    LOCALIZADO_PROVISORIAMENTE = "Localizado Provisoriamente"
    EFETIVO_PMC = "Efetivo PMC"
    EFETIVO_SEDU = "Efetivo SEDU"
    ESTATUTARIO = "Estatutário"
    CELETISTA = "Celetista"


class Turno(Enum):
    """Turnos de trabalho"""
    MATUTINO = "Matutino"
    VESPERTINO = "Vespertino"


class TipoInstituicao(Enum):
    """Tipos de instituição"""
    PUBLICA = "Pública"
    PRIVADA = "Privada"


class TipoPosGraduacao(Enum):
    """Tipos de pós-graduação"""
    ESPECIALIZACAO = "Especialização"
    MESTRADO = "Mestrado"
    DOUTORADO = "Doutorado"


class StatusCurso(Enum):
    """Status de um curso"""
    CONCLUIDO = "Concluído"
    EM_ANDAMENTO = "Em Andamento"


class CursoEspecifico(Enum):
    """Cursos específicos de formação continuada"""
    CRECHE = "Creche (0 a 3 anos)"
    PRE_ESCOLA = "Pré-Escola (4 e 5 anos)"
    ANOS_INICIAIS_EF = "Anos Iniciais Ensino Fundamental"
    ANOS_FINAIS_EF = "Anos Finais Ensino Fundamental"
    ENSINO_MEDIO = "Ensino Médio"
    EDUCACAO_ESPECIAL = "Educação Especial"
    EDUCACAO_AMBIENTAL = "Educação Ambiental"
    EDUCACAO_JOVENS_ADULTOS = "Educação de Jovens e Adultos"
    EDUCACAO_CAMPO = "Educação do Campo"
    EDUCACAO_INDIGENA = "Educação Indígena"
    GENERO_DIVERSIDADE = "Gênero e diversidade sexual"
    EDUCACAO_DIREITOS_HUMANOS = "Educação em Direitos Humanos"
    EDUCACAO_ETNORRACIAL = "Educação para as relações etnorraciais e história e cultura afro-brasileira"
    OUTROS = "Outros"
    NENHUM = "Nenhum"


# ============================================
# DATACLASSES
# ============================================

@dataclass
class CarteiraIdentidade:
    """Informações da carteira de identidade"""
    numero: str
    orgao_emissor: str
    data_expedicao: str


@dataclass
class CarteiraProfissional:
    """Informações da carteira profissional"""
    numero: str
    serie: str


@dataclass
class DadosPessoais:
    """Dados pessoais do funcionário"""
    nome_completo: str
    data_nascimento: str
    naturalidade: str
    cor: str
    cpf: str
    carteira_identidade: CarteiraIdentidade
    carteira_profissional: CarteiraProfissional
    titulo_eleitoral: str
    pis_pasep: str
    cargo: str
    matricula_funcional: str


@dataclass
class Filiacao:
    """Dados de filiação"""
    mae: str
    pai: str


@dataclass
class EnderecoResidencial:
    """Endereço residencial"""
    rua: str
    numero: str
    bairro: str
    cep: str
    telefone: str
    celular: str
    email: str
    apartamento: Optional[str] = None


@dataclass
class AreaAtuacao:
    """Área de atuação do funcionário"""
    anos_iniciais_ef: bool
    anos_finais_ef: bool
    administrativo: bool
    turno: Turno
    descricao_area: Optional[str] = None


@dataclass
class ComplementoOutraEscola:
    """Complemento de carga horária em outra escola"""
    escola: str
    carga_horaria: float


@dataclass
class SituacaoFuncional:
    """Situação funcional do servidor"""
    tipo_vinculo: TipoVinculo
    disciplinas: List[str]
    carga_horaria: float
    escolas_de_origem: List[str] = field(default_factory=list)
    complemento_outras_escolas: List[ComplementoOutraEscola] = field(default_factory=list)


@dataclass
class CursoSuperior:
    """Informações de curso superior"""
    nome: str
    ano_inicio: int
    instituicao: str
    tipo_instituicao: TipoInstituicao
    status_curso: StatusCurso
    ano_conclusao: Optional[int] = None


@dataclass
class PosGraduacao:
    """Informações de pós-graduação"""
    tipo: TipoPosGraduacao
    nome: str
    status: StatusCurso
    ano_conclusao: Optional[int] = None


@dataclass
class EscolarizacaoFormacao:
    """Escolarização e formação acadêmica"""
    ensino_medio: str
    curso_superior: Optional[CursoSuperior] = None
    pos_graduacao: List[PosGraduacao] = field(default_factory=list)
    estudos_adicionais: Optional[str] = None


@dataclass
class FormacaoContinuada:
    """Formação continuada"""
    cursos: List[CursoEspecifico]
    total_horas: float = 0.0


@dataclass
class DadosEscola:
    """Informações da escola"""
    nome: str
    endereco: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    cep: str
    telefone: str


@dataclass
class FichaFuncional:
    """Ficha funcional completa do funcionário"""
    ano: int
    escola: DadosEscola
    dados_pessoais: DadosPessoais
    filiacao: Filiacao
    endereco: EnderecoResidencial
    area_atuacao: AreaAtuacao
    situacao_funcional: SituacaoFuncional
    escolarizacao: EscolarizacaoFormacao
    formacao_continuada: FormacaoContinuada
    data_preenchimento: Optional[datetime] = None
    assinatura: Optional[str] = None


# ============================================
# CLASSE GERENCIADORA
# ============================================

class FichaFuncionalManager:
    """Gerenciador de Ficha Funcional"""

    def __init__(self, ficha: FichaFuncional):
        self.ficha = ficha

    def get_dados_pessoais(self) -> DadosPessoais:
        """Obtém dados pessoais"""
        return self.ficha.dados_pessoais

    def validar_email(self) -> bool:
        """Valida formato do email"""
        import re
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return bool(re.match(email_regex, self.ficha.endereco.email))

    def validar_cpf(self) -> bool:
        """Valida CPF (verificação básica de formato)"""
        cpf = self.ficha.dados_pessoais.cpf.replace('.', '').replace('-', '')
        return len(cpf) == 11 and cpf.isdigit()

    def calcular_carga_horaria_total(self) -> float:
        """Calcula carga horária total"""
        total = self.ficha.situacao_funcional.carga_horaria

        for complemento in self.ficha.situacao_funcional.complemento_outras_escolas:
            total += complemento.carga_horaria

        return total

    def tem_pos_graduacao(self) -> bool:
        """Verifica se tem pós-graduação"""
        return len(self.ficha.escolarizacao.pos_graduacao) > 0

    def listar_disciplinas(self) -> List[str]:
        """Lista todas as disciplinas"""
        return self.ficha.situacao_funcional.disciplinas

    def listar_cursos_continuada(self) -> List[str]:
        """Lista cursos de formação continuada"""
        return [curso.value for curso in self.ficha.formacao_continuada.cursos]

    def exportar_json(self) -> str:
        """Exporta dados em JSON"""
        def converter_enum(obj):
            if isinstance(obj, Enum):
                return obj.value
            elif isinstance(obj, datetime):
                return obj.isoformat()
            elif hasattr(obj, '__dict__'):
                return {k: converter_enum(v) for k, v in obj.__dict__.items()}
            elif isinstance(obj, list):
                return [converter_enum(item) for item in obj]
            return obj

        dados = converter_enum(self.ficha)
        return json.dumps(dados, ensure_ascii=False, indent=2)

    def exportar_csv(self) -> str:
        """Exporta dados principais em CSV"""
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'Nome Completo',
            'CPF',
            'Cargo',
            'Área de Atuação',
            'Carga Horária Total',
            'Turno',
            'Email',
            'Tipo de Vínculo',
            'Instituição Superior',
            'Tem Pós-Graduação'
        ])

        writer.writeheader()
        writer.writerow({
            'Nome Completo': self.ficha.dados_pessoais.nome_completo,
            'CPF': self.ficha.dados_pessoais.cpf,
            'Cargo': self.ficha.dados_pessoais.cargo,
            'Área de Atuação': self.ficha.area_atuacao.descricao_area or 'N/A',
            'Carga Horária Total': f"{self.calcular_carga_horaria_total()}h",
            'Turno': self.ficha.area_atuacao.turno.value,
            'Email': self.ficha.endereco.email,
            'Tipo de Vínculo': self.ficha.situacao_funcional.tipo_vinculo.value,
            'Instituição Superior': self.ficha.escolarizacao.curso_superior.instituicao if self.ficha.escolarizacao.curso_superior else 'N/A',
            'Tem Pós-Graduação': 'Sim' if self.tem_pos_graduacao() else 'Não'
        })

        return output.getvalue()

    def gerar_relatorio_texto(self) -> str:
        """Gera relatório em formato texto"""
        lines = [
            "=" * 60,
            "FICHA FUNCIONAL - RELATÓRIO",
            "=" * 60,
            f"\nESCOLA: {self.ficha.escola.nome}",
            f"Endereço: {self.ficha.escola.endereco}, {self.ficha.escola.numero}",
            f"            {self.ficha.escola.bairro} - {self.ficha.escola.cidade}/{self.ficha.escola.estado}",
            f"            CEP: {self.ficha.escola.cep}",
            f"\n{'=' * 60}",
            f"DADOS PESSOAIS",
            f"{'=' * 60}",
            f"Nome: {self.ficha.dados_pessoais.nome_completo}",
            f"CPF: {self.ficha.dados_pessoais.cpf}",
            f"Data de Nascimento: {self.ficha.dados_pessoais.data_nascimento}",
            f"Naturalidade: {self.ficha.dados_pessoais.naturalidade}",
            f"Cargo: {self.ficha.dados_pessoais.cargo}",
            f"Matrícula: {self.ficha.dados_pessoais.matricula_funcional}",
            f"\n{'=' * 60}",
            f"SITUAÇÃO FUNCIONAL",
            f"{'=' * 60}",
            f"Tipo de Vínculo: {self.ficha.situacao_funcional.tipo_vinculo.value}",
            f"Turno: {self.ficha.area_atuacao.turno.value}",
            f"Disciplinas: {', '.join(self.ficha.situacao_funcional.disciplinas)}",
            f"Carga Horária Total: {self.calcular_carga_horaria_total()}h",
            f"\n{'=' * 60}",
            f"ESCOLARIZAÇÃO",
            f"{'=' * 60}",
            f"Ensino Médio: {self.ficha.escolarizacao.ensino_medio}",
        ]

        if self.ficha.escolarizacao.curso_superior:
            cs = self.ficha.escolarizacao.curso_superior
            lines.extend([
                f"Curso Superior: {cs.nome}",
                f"Instituição: {cs.instituicao}",
                f"Status: {cs.status_curso.value}",
                f"Período: {cs.ano_inicio}" + (f" - {cs.ano_conclusao}" if cs.ano_conclusao else "")
            ])

        if self.tem_pos_graduacao():
            lines.append(f"Pós-Graduação: Sim ({len(self.ficha.escolarizacao.pos_graduacao)} cursos)")
        else:
            lines.append("Pós-Graduação: Não")

        lines.extend([
            f"Formação Continuada: {self.ficha.formacao_continuada.total_horas}h",
            f"\n{'=' * 60}",
            f"CONTATO",
            f"{'=' * 60}",
            f"Email: {self.ficha.endereco.email}",
            f"Telefone: {self.ficha.endereco.telefone}",
            f"Celular: {self.ficha.endereco.celular}",
            f"{'=' * 60}\n"
        ])

        return "\n".join(lines)


# ============================================
# EXEMPLO DE USO
# ============================================

def criar_ficha_exemplo() -> FichaFuncional:
    """Cria uma ficha funcional de exemplo"""

    escola = DadosEscola(
        nome='EMEF "Dr. Octávio Manhães de Andrade"',
        endereco='Rua Benjamin Costa',
        numero='78',
        bairro='Sagrado Coração de Jesus',
        cidade='Colatina',
        estado='ES',
        cep='29707-130',
        telefone='(27) 3722-3708'
    )

    dados_pessoais = DadosPessoais(
        nome_completo='Maria da Silva Santos',
        data_nascimento='10/05/1990',
        naturalidade='Colatina',
        cor='Parda',
        cpf='123.456.789-10',
        carteira_identidade=CarteiraIdentidade(
            numero='123456789',
            orgao_emissor='SSP/ES',
            data_expedicao='15/07/2015'
        ),
        carteira_profissional=CarteiraProfissional(
            numero='987654321',
            serie='A'
        ),
        titulo_eleitoral='111222333444',
        pis_pasep='555.666.777-88',
        cargo='Professora',
        matricula_funcional='MAT-2026-001'
    )

    filiacao = Filiacao(
        mae='Joana da Silva',
        pai='Santos Silva Junior'
    )

    endereco = EnderecoResidencial(
        rua='Avenida Getúlio Vargas',
        numero='1500',
        apartamento='804',
        bairro='Centro',
        cep='29700-100',
        telefone='(27) 3721-1234',
        celular='(27) 98888-7777',
        email='maria.silva@email.com'
    )

    area_atuacao = AreaAtuacao(
        anos_iniciais_ef=True,
        anos_finais_ef=False,
        administrativo=False,
        turno=Turno.MATUTINO,
        descricao_area='Ensino Fundamental - Anos Iniciais'
    )

    situacao_funcional = SituacaoFuncional(
        tipo_vinculo=TipoVinculo.EFETIVO_PMC,
        disciplinas=['Português', 'Matemática', 'Ciências Naturais'],
        carga_horaria=40.0,
        complemento_outras_escolas=[
            ComplementoOutraEscola(
                escola='EMEF Vila Nova',
                carga_horaria=10.0
            )
        ]
    )

    escolarizacao = EscolarizacaoFormacao(
        ensino_medio='Ensino Médio Completo',
        estudos_adicionais='Certificado em Informática Básica',
        curso_superior=CursoSuperior(
            nome='Pedagogia',
            ano_inicio=2008,
            ano_conclusao=2012,
            instituicao='Universidade Federal do Espírito Santo',
            tipo_instituicao=TipoInstituicao.PUBLICA,
            status_curso=StatusCurso.CONCLUIDO
        ),
        pos_graduacao=[
            PosGraduacao(
                tipo=TipoPosGraduacao.ESPECIALIZACAO,
                nome='Alfabetização e Letramento',
                ano_conclusao=2015,
                status=StatusCurso.CONCLUIDO
            )
        ]
    )

    formacao_continuada = FormacaoContinuada(
        cursos=[
            CursoEspecifico.ANOS_INICIAIS_EF,
            CursoEspecifico.EDUCACAO_ESPECIAL,
            CursoEspecifico.GENERO_DIVERSIDADE
        ],
        total_horas=140.0
    )

    return FichaFuncional(
        ano=2026,
        escola=escola,
        dados_pessoais=dados_pessoais,
        filiacao=filiacao,
        endereco=endereco,
        area_atuacao=area_atuacao,
        situacao_funcional=situacao_funcional,
        escolarizacao=escolarizacao,
        formacao_continuada=formacao_continuada,
        data_preenchimento=datetime.now()
    )


# ============================================
# DEMONSTRAÇÃO
# ============================================

if __name__ == '__main__':
    # Criar ficha de exemplo
    ficha = criar_ficha_exemplo()

    # Criar gerenciador
    manager = FichaFuncionalManager(ficha)

    # Exibir relatório
    print(manager.gerar_relatorio_texto())

    # Exibir informações específicas
    print("\n[*] INFORMACOES RESUMIDAS:")
    print(f"  Email valido:               {manager.validar_email()}")
    print(f"  CPF valido:                 {manager.validar_cpf()}")
    print(f"  Carga horaria total:        {manager.calcular_carga_horaria_total()}h")
    print(f"  Tem pos-graduacao:          {manager.tem_pos_graduacao()}")
    print(f"  Disciplinas:                {', '.join(manager.listar_disciplinas())}")
    print(f"  Cursos form. continuada:    {len(ficha.formacao_continuada.cursos)}")

    # Exportar em diferentes formatos
    print("\n\n" + "=" * 60)
    print("EXPORTAÇÃO EM CSV:")
    print("=" * 60)
    print(manager.exportar_csv())

    print("\n" + "=" * 60)
    print("EXPORTAÇÃO EM JSON (primeiras linhas):")
    print("=" * 60)
    json_export = manager.exportar_json()
    print(json_export[:500] + "...\n(arquivo completo gerado)")

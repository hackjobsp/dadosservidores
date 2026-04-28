// ─── PDF Generator v6 — window.print() — 100% fiel ao modelo oficial ──────────

async function gerarFichaPDF(teacherName, data) {
  const v  = (key) => (data && data[key]) ? String(data[key]).trim() : "";
  const chk = (cond) => cond ? "X" : "&nbsp;";
  const ul  = (value, minW) =>
    `<span style="display:inline-block;border-bottom:0.75pt solid #000;min-width:${minW};vertical-align:bottom;padding:0 2pt;font-weight:400;">${value || "&nbsp;"}</span>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"/>
<title>Ficha Funcional — ${teacherName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 8mm 10mm; }
  body { font-family: Arial, sans-serif; font-size: 8pt; color: #000; background: #fff; line-height: 1.3; }

  /* ── CABEÇALHO SUPERIOR ── */
  .cab-topo {
    text-align: center;
    border: 1pt solid #000;
    padding: 4pt 6pt;
    margin-bottom: 0;
  }
  .cab-topo .escola-nome { font-size: 10pt; font-weight: 900; }
  .cab-topo .escola-info { font-size: 8pt; }

  /* ── FAIXA "FICHA FUNCIONAL 2026" ── */
  .faixa-titulo {
    text-align: center;
    font-size: 11pt;
    font-weight: 900;
    border: 1pt solid #000;
    border-top: none;
    padding: 3pt;
    margin-bottom: 0;
    letter-spacing: 1pt;
  }

  /* ── TABELA PRINCIPAL ── */
  table.ficha {
    width: 100%;
    border-collapse: collapse;
    border: 1pt solid #000;
    border-top: none;
    table-layout: fixed;
  }
  table.ficha td {
    border: 0.5pt solid #000;
    padding: 2pt 4pt;
    vertical-align: middle;
    font-size: 7.5pt;
  }
  /* Coluna lateral de rótulo de seção */
  td.sec {
    width: 55pt;
    font-weight: 900;
    font-size: 7.5pt;
    text-align: center;
    vertical-align: middle;
    line-height: 1.3;
    background: #fff;
  }
  td.sec.vtop { vertical-align: top; padding-top: 4pt; }

  /* Labels inline */
  b.lbl { font-size: 7pt; font-weight: 800; }

  /* Underline spans */
  .ul { display:inline-block; border-bottom:0.75pt solid #000; min-height:10pt; vertical-align:bottom; padding:0 2pt; }

  /* ── SEÇÃO OUTROS CURSOS ── */
  .outros-titulo {
    text-align: center;
    font-weight: 900;
    font-size: 7.5pt;
    border: 0.5pt solid #000;
    border-top: none;
    padding: 3pt;
    background: #fff;
  }
  table.outros {
    width: 100%;
    border-collapse: collapse;
    border: 0.5pt solid #000;
    border-top: none;
    table-layout: fixed;
  }
  table.outros td {
    border: none;
    padding: 1pt 4pt;
    font-size: 7pt;
    vertical-align: top;
  }

  /* ── RODAPÉ ── */
  .rodape-bemvindo {
    text-align: center;
    font-weight: 900;
    font-size: 8pt;
    border: 0.5pt solid #000;
    border-top: none;
    padding: 4pt;
  }

  @media print { body { margin: 0; } }
</style>
</head>
<body>

<!-- CABEÇALHO: Nome da escola -->
<div class="cab-topo">
  <div class="escola-nome">EMEF "Dr. Octávio Manhães de Andrade"</div>
  <div class="escola-info">Rua Benjamin Costa, nº 78 – Sagrado Coração de Jesus</div>
  <div class="escola-info">Colatina – ES &nbsp; CEP: 29707-130 &nbsp; Tel.: (27) 3722-3708</div>
</div>

<!-- FAIXA TÍTULO -->
<div class="faixa-titulo">FICHA FUNCIONAL – 2026</div>

<!-- TABELA PRINCIPAL -->
<table class="ficha">

  <!-- ── DADOS PESSOAIS ── -->
  <tr>
    <td class="sec" rowspan="7">Dados<br>Pessoais</td>
    <td colspan="5" style="border-left:0.5pt solid #000;">
      <b class="lbl">NOME COMPLETO:</b> ${ul(v("nomeCompleto"), "85%")}
    </td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Data de Nascimento:</b> ${ul(v("dataNascimento"), "90pt")}</td>
    <td colspan="3"><b class="lbl">Naturalidade:</b> ${ul(v("naturalidade"), "100pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Cor:</b> ${ul(v("cor"), "90pt")}</td>
    <td colspan="3"><b class="lbl">CPF:</b> ${ul(v("cpf"), "110pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Carteira de Identidade:</b> ${ul(v("rg"), "80pt")}</td>
    <td><b class="lbl">Órg. Emissor:</b> ${ul(v("rgEmissor"), "50pt")}</td>
    <td colspan="2"><b class="lbl">Data de Expedição:</b> ${ul(v("rgExpedicao"), "70pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Carteira Profissional Nº:</b> ${ul(v("ctpsNumero"), "80pt")}</td>
    <td colspan="3"><b class="lbl">Série:</b> ${ul(v("ctpsSerie"), "80pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Título Eleitoral:</b> ${ul(v("tituloEleitoral"), "100pt")}</td>
    <td colspan="3"><b class="lbl">PIS/PASEP:</b> ${ul(v("pisPasep"), "100pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Cargo (contra-cheque):</b> ${ul(v("cargoContraCheque"), "100pt")}</td>
    <td colspan="3"><b class="lbl">Matrícula/Nº Funcional:</b> ${ul(v("matriculaFuncional"), "100pt")}</td>
  </tr>

  <!-- ── FILIAÇÃO ── -->
  <tr>
    <td class="sec" rowspan="2">Filiação:</td>
    <td colspan="5"><b class="lbl">Mãe:</b> ${ul(v("nomeMae"), "87%")}</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Pai:</b> ${ul(v("nomePai"), "87%")}</td>
  </tr>

  <!-- ── ENDEREÇO RESIDENCIAL ── -->
  <tr>
    <td class="sec" rowspan="3">Endereço<br>Residencial</td>
    <td colspan="3"><b class="lbl">Rua/Av:</b> ${ul(v("enderecoRua"), "65%")}</td>
    <td><b class="lbl">Nº:</b> ${ul(v("enderecoNum"), "35pt")}</td>
    <td><b class="lbl">Aptº:</b> ${ul(v("enderecoApt"), "35pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Bairro:</b> ${ul(v("enderecoBairro"), "80%")}</td>
    <td colspan="3"><b class="lbl">CEP:</b> ${ul(v("cep"), "90pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Tel:</b> ${ul(v("telefone"), "60pt")} &nbsp; <b class="lbl">Celular:</b> ${ul(v("telefoneCelular"), "80pt")}</td>
    <td colspan="3"><b class="lbl">e-mail:</b> ${ul(v("email"), "130pt")}</td>
  </tr>

  <!-- ── ÁREA DE ATUAÇÃO ── -->
  <tr>
    <td class="sec vtop" rowspan="4">Área de<br>Atuação</td>
    <td colspan="5">( ${chk(data?.anosIniciaisEF)} ) Anos Iniciais do Ensino Fundamental: ${ul(v("anosIniciaisDisc"), "160pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.anosFinaisEF)} ) Anos Finais do Ensino Fundamental: ${ul(v("anosFinaisDisc"), "160pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.administrativo)} ) Administrativo: ${ul(v("administrativoDesc"), "180pt")}</td>
  </tr>
  <tr>
    <td colspan="5">Turno de trabalho: &nbsp; ( ${chk(data?.turnoTrabalho === "Matutino")} ) Matutino &nbsp;&nbsp;&nbsp; ( ${chk(data?.turnoTrabalho === "Vespertino")} ) Vespertino</td>
  </tr>

  <!-- ── SITUAÇÃO FUNCIONAL ── -->
  <tr>
    <td class="sec vtop" rowspan="9">Situação<br>Funcional<br><span style="font-size:6pt;font-weight:400;">(nesta U.E.)</span></td>
    <td colspan="5">( ${chk(data?.sfEstagiario)} ) Estagiário &nbsp; Carga Horária: ${ul(v("sfEstagiarioCH"), "80pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.sfDTPMC1)} ) DT PMC: Disciplina(s) ${ul(v("sfDTPMC_Disc1"), "170pt")} Carga Horária: ${ul(v("sfDTPMC_CH1"), "40pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.sfLocalizado)} ) Localizado Provisoriamente: Disciplina(s): ${ul(v("sfLocalizadoDisc"), "120pt")} Carga Horária: ${ul(v("sfLocalizadoCH"), "40pt")}</td>
  </tr>
  <tr>
    <td colspan="5">Escola(s) de origem: ${ul(v("sfEscolaOrigem"), "300pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.sfEfetivoPMC)} ) Efetivo PMC &nbsp; ( ${chk(data?.sfEstatutario)} ) Estatutário &nbsp; ( ${chk(data?.sfCeletista)} ) Celetista - Disciplina(s) ${ul(v("sfEfetivoPMC_Disc"), "100pt")} Carga Horária: ${ul(v("sfEfetivoPMC_CH"), "35pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.sfEfetivoSEDU)} ) Efetivo SEDU: Disciplina(s) ${ul(v("sfEfetivoSEDU_Disc"), "165pt")} Carga Horária: ${ul(v("sfEfetivoSEDU_CH"), "40pt")}</td>
  </tr>
  <tr>
    <td colspan="5">( ${chk(data?.sfDTPMC2)} ) DT PMC: Disciplina(s) ${ul(v("sfDTPMC_Disc2"), "165pt")} Carga Horária: ${ul(v("sfDTPMC_CH2"), "40pt")}</td>
  </tr>
  <tr>
    <td colspan="5" style="font-size:7pt;"><b>OBS.: Especifique a sua Carga Horária caso complete em outra(s) escola(s):</b></td>
  </tr>
  <tr>
    <td colspan="5">
      Escola: ${ul(v("sfEscolaComp1"), "200pt")} Carga Horária: ${ul(v("sfEscolaComp1CH"), "40pt")} &nbsp;&nbsp;
      Escola: ${ul(v("sfEscolaComp2"), "200pt")} Carga Horária: ${ul(v("sfEscolaComp2CH"), "40pt")}
    </td>
  </tr>

  <!-- ── ESCOLARIZAÇÃO / FORMAÇÃO ACADÊMICA ── -->
  <tr>
    <td class="sec vtop" rowspan="11">Escolarização<br>Formação<br>Acadêmica<br><br><span style="font-size:6pt;font-weight:400;">(Especificar<br>cada nível de<br>Ensino)</span></td>
    <td colspan="5"><b class="lbl">Ensino Médio:</b> ${ul(v("ensinoMedio"), "82%")}</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Estudos Adicionais:</b> ${ul(v("estudosAdicionais"), "78%")}</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Curso Superior Concluído:</b> ${ul(v("cursoSuperiorConcluido"), "72%")}</td>
  </tr>
  <tr>
    <td colspan="5">Ano de Início: ${ul(v("superiorConcluidoInicio"), "35pt")} &nbsp; Ano de Conclusão: ${ul(v("superiorConcluidoFim"), "35pt")} &nbsp; Tipo de Instituição: ( ${chk(data?.superiorConcluidoInstTipo === "Pública")} ) Pública &nbsp; ( ${chk(data?.superiorConcluidoInstTipo === "Privada")} ) Privada</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Nome da Instituição:</b> ${ul(v("superiorConcluidoInstNome"), "78%")}</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Curso Superior em andamento:</b> ${ul(v("cursoSuperiorAndamento"), "70%")}</td>
  </tr>
  <tr>
    <td colspan="5">Ano de Início: ${ul(v("superiorAndamentoInicio"), "35pt")} &nbsp; Tipo de Instituição: ( ${chk(data?.superiorAndamentoInstTipo === "Pública")} ) Pública &nbsp; ( ${chk(data?.superiorAndamentoInstTipo === "Privada")} ) Privada</td>
  </tr>
  <tr>
    <td colspan="5"><b class="lbl">Nome da Instituição:</b> ${ul(v("superiorAndamentoInstNome"), "78%")}</td>
  </tr>
  <!-- Pós-Graduação: coluna esquerda + grid -->
  <tr>
    <td rowspan="3" style="vertical-align:top;padding-top:2pt;">
      <b class="lbl">Pós Graduação:</b><br>
      ( ${chk(data?.posGradStatus === "Concluído")} ) Concluído<br>
      ( ${chk(data?.posGradStatus === "Cursando")} ) Cursando
    </td>
    <td colspan="2"><b class="lbl">Especialização:</b> ${ul(v("especializacao"), "100pt")}</td>
    <td colspan="2"><b class="lbl">Conclusão:</b> ${ul(v("especializacaoConclusao"), "50pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Mestrado:</b> ${ul(v("mestrado"), "100pt")}</td>
    <td colspan="2"><b class="lbl">Conclusão:</b> ${ul(v("mestradoConclusao"), "50pt")}</td>
  </tr>
  <tr>
    <td colspan="2"><b class="lbl">Doutorado:</b> ${ul(v("doutorado"), "100pt")}</td>
    <td colspan="2"><b class="lbl">Conclusão:</b> ${ul(v("doutradoConclusao"), "50pt")}</td>
  </tr>

</table>

<!-- OUTROS CURSOS ESPECÍFICOS -->
<div class="outros-titulo">Outros Cursos Específicos (Formação Continuada no mínimo 80 horas -2019)</div>
<table class="outros">
  <tr>
    <td>( ${chk(data?.fcCreche)} ) Creche (0 a 3 anos)</td>
    <td>( ${chk(data?.fcPreEscola)} ) Pré-Escola (4 e 5 anos)</td>
    <td>( ${chk(data?.fcEJA)} ) Educação de Jovens e Adultos</td>
  </tr>
  <tr>
    <td>( ${chk(data?.fcAnosFinais)} ) Anos Finais Ensino Fundamental</td>
    <td>( ${chk(data?.fcEnsinoMedio)} ) Ensino Médio</td>
    <td>( ${chk(data?.fcEdCampo)} ) Educação do Campo</td>
  </tr>
  <tr>
    <td>( ${chk(data?.fcAnosIniciais)} ) Anos Iniciais Ensino Fundamental</td>
    <td>( ${chk(data?.fcEdIndigena)} ) Educação Indígena</td>
    <td>( ${chk(data?.fcGenero)} ) Gênero e diversidade sexual</td>
  </tr>
  <tr>
    <td>( ${chk(data?.fcEdEspecial)} ) Educação Especial</td>
    <td>( ${chk(data?.fcDirHumanos)} ) Educação em Direitos Humanos</td>
    <td>( ${chk(data?.fcOutros)} ) Outros</td>
  </tr>
  <tr>
    <td>( ${chk(data?.fcEdAmbiental)} ) Educação Ambiental</td>
    <td>( ${chk(data?.fcRelacoes)} ) Educação para as relações étnico-raciais e história e cultura afro-brasileira e africana</td>
    <td>( ${chk(data?.fcNenhum)} ) Nenhum</td>
  </tr>
</table>

<!-- RODAPÉ BOAS-VINDAS -->
<div class="rodape-bemvindo">Seja bem-vindo(a)! Você é um(a) integrante do grupo de profissionais desta escola.</div>

<script>
  window.onload = function () {
    setTimeout(function () { window.print(); }, 400);
    window.onafterprint = function () { window.close(); };
  };
</script>
</body></html>`;

  const w = window.open("", "_blank", "width=860,height=750,scrollbars=yes");
  if (!w) {
    alert("⚠️ Pop-up bloqueado! Libere pop-ups para este site e tente novamente.");
    return;
  }
  w.document.write(html);
  w.document.close();
}

// ─── Baixar documento simples ─────────────────────────────────────────────────
async function docToPDF(record) {
  const { jsPDF } = window.jspdf || window;
  let url = record.url;
  if (!url && record.data) {
    const blob = new Blob([record.data], { type: record.fileType });
    url = URL.createObjectURL(blob);
  }
  if (record.fileType === "application/pdf" || (record.fileName && record.fileName.endsWith(".pdf"))) {
    const a = document.createElement("a");
    a.href = url; a.download = record.fileName; a.click();
    return;
  }
  const pdf = new jsPDF();
  pdf.text("Arquivo: " + record.fileName, 20, 20);
  pdf.text("Categoria: " + record.docLabel, 20, 30);
  pdf.save(record.fileName + ".pdf");
}

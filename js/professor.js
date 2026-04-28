// ─── Servidor Page Logic v2 ──────────────────────────────────────────────────
// Formulário visual idêntico ao FICHA FUNCIONAL MODELO.pdf
let teacherId  = null;
let teacher    = null;
let currentTab = "ficha";
let uploadedDocs = {};

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    window.location.href = "index.html";
    return;
  }

  try {
    // 1. Carregar dados do servidor via API
    const teacherData = await getTeacher(id);
    if (!teacherData) {
      alert("Pasta não encontrada!");
      window.location.href = "index.html";
      return;
    }

    teacherId = id;
    teacher = teacherData;

    document.getElementById("headerTeacherName").textContent = teacher.name;
    document.title = `${teacher.name} — Ficha Funcional`;

    await openDB();
    buildFichaForm();

    const ficha = await getFicha(teacherId);
    if (ficha && ficha.data) {
      populateFichaForm(ficha.data);
      updateHeaderStatus(ficha.status);
    }

    const docs = await getDocumentsByTeacher(teacherId);
    uploadedDocs = {};
    docs.forEach(doc => {
      if (!uploadedDocs[doc.docType]) uploadedDocs[doc.docType] = [];
      uploadedDocs[doc.docType].push(doc);
    });

    buildDocCategories();
    updateProgress();

    document.getElementById("fichaForm").addEventListener("input", () => {
      clearTimeout(window._autoSaveTimer);
      window._autoSaveTimer = setTimeout(autoSave, 800);
      updateProgress();
    });

  } catch (e) {
    console.error("Erro na inicialização:", e);
    showToast("❌ Erro ao carregar dados.", "danger");
  } finally {
    const loader = document.getElementById("pageLoader");
    if (loader) { loader.classList.add("hidden"); setTimeout(() => loader.remove(), 500); }
    lucide.createIcons();
    updateScale();
  }
}

// ─── Tab Switch ───────────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tabFicha").classList.toggle("active", tab === "ficha");
  document.getElementById("tabDocs").classList.toggle("active", tab === "docs");
  document.getElementById("panelFicha").classList.toggle("active", tab === "ficha");
  document.getElementById("panelDocs").classList.toggle("active", tab === "docs");
  updateConfirmBar();
}

// ─── Build Ficha Form — visual igual ao PDF 1:1 ───────────────────────────────────
function buildFichaForm() {
  const body = document.getElementById("fichaFormBody");
  if (!body) return;

  const html = `
    <div id="ficha-scale-wrapper" style="width: 100%; overflow: hidden;">
      <div id="ficha-container" style="
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 8mm 10mm;
        background: #fff;
        font-family: Arial, sans-serif;
        color: #000;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        font-size: 8pt;
        line-height: 1.3;
        box-sizing: border-box;
      ">
        <style>
          .cab-topo { text-align: center; border: 1pt solid #000; padding: 4pt 6pt; }
          .cab-topo .escola-nome { font-size: 10pt; font-weight: 900; }
          .faixa-titulo { text-align: center; font-size: 11pt; font-weight: 900; border: 1pt solid #000; border-top: none; padding: 3pt; letter-spacing: 1pt; }
          .ficha-table { width: 100%; border-collapse: collapse; border: 1pt solid #000; border-top: none; }
          .ficha-table td { border: 0.5pt solid #000; padding: 3pt 5pt; vertical-align: middle; font-size: 7.5pt; word-break: break-word; }
          .sec { width: 60pt; font-weight: 900; font-size: 7.5pt; text-align: center; vertical-align: middle; line-height: 1.2; }
          .sec.vtop { vertical-align: top; padding-top: 4pt; }
          .lbl { font-size: 7pt; font-weight: 800; white-space: nowrap; }
          .table-input { border: none; border-bottom: 0.5pt solid #000; font-size: 8pt; padding: 0 2pt; background: transparent; outline: none; font-family: Arial, sans-serif; width: 100%; box-sizing: border-box; }
          .table-input:focus { background: #fffde7; }
          .cell-row { display: flex; align-items: center; gap: 4pt; flex-wrap: nowrap; }
          .cell-row .table-input { flex: 1; width: auto; }
          .outros-titulo { text-align: center; font-weight: 900; font-size: 7.5pt; border: 0.5pt solid #000; border-top: none; padding: 3pt; }
          .outros-table { width: 100%; border-collapse: collapse; border: 0.5pt solid #000; border-top: none; }
          .outros-table td { border: none; padding: 2pt 5pt; font-size: 7pt; vertical-align: top; width: 33.33%; }
          .outros-table label { display: flex; align-items: flex-start; gap: 3pt; cursor: pointer; margin-bottom: 2pt; }
          .rodape-bemvindo { text-align: center; font-weight: 900; font-size: 8pt; border: 0.5pt solid #000; border-top: none; padding: 5pt; }

          /* Responsividade Mobile */
          @media screen and (max-width: 600px) {
            #ficha-container { 
              width: 100% !important; 
              min-height: auto !important; 
              padding: 5mm !important; 
              transform: none !important; 
            }
            .ficha-table, .ficha-table tbody, .ficha-table tr, .ficha-table td { 
              display: block !important; 
              width: 100% !important; 
              border-bottom: none !important; 
            }
            .ficha-table td { border-right: 0.5pt solid #000 !important; border-left: 0.5pt solid #000 !important; border-bottom: 0.5pt solid #000 !important; }
            .sec { 
              width: 100% !important; 
              background: #f8f9fa; 
              padding: 6pt !important; 
              border-bottom: 1pt solid #000 !important; 
              text-align: left !important;
            }
            .cell-row { flex-wrap: wrap !important; gap: 2pt !important; }
            .table-input { font-size: 10pt !important; height: 24pt; border-bottom: 1px solid #ccc; }
            .lbl { font-size: 8pt !important; color: #555; }
            .outros-table td { display: block !important; width: 100% !important; border-bottom: 1px solid #eee !important; }
          }
          
          @media screen and (min-width: 601px) and (max-width: 800px) {
            #ficha-container { transform-origin: top center; }
          }
        </style>

        <div class="cab-topo">
          <div class="escola-nome">EMEF "Dr. Octávio Manhães de Andrade"</div>
          <div>Rua Benjamin Costa, nº 78 – Sagrado Coração de Jesus</div>
          <div>Colatina – ES &nbsp; CEP: 29707-130 &nbsp; Tel.: (27) 3722-3708</div>
        </div>
        <div class="faixa-titulo">FICHA FUNCIONAL – 2026</div>

        <table class="ficha-table">
          <tr>
            <td class="sec" rowspan="7">Dados<br>Pessoais</td>
            <td colspan="5"><div class="cell-row"><span class="lbl">NOME COMPLETO:</span> <input type="text" name="nomeCompleto" id="f_nomeCompleto" class="table-input" style="font-weight:800;"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Data de Nascimento:</span> <input type="text" name="dataNascimento" id="f_dataNascimento" class="table-input" placeholder="00/00/0000"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">Naturalidade:</span> <input type="text" name="naturalidade" id="f_naturalidade" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Cor:</span> <input type="text" name="cor" class="table-input"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">CPF:</span> <input type="text" name="cpf" id="f_cpf" class="table-input" placeholder="000.000.000-00"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Carteira de Identidade:</span> <input type="text" name="rg" id="f_rg" class="table-input"></div></td>
            <td><div class="cell-row"><span class="lbl">Órg. Emissor:</span> <input type="text" name="rgEmissor" id="f_rgEmissor" class="table-input"></div></td>
            <td colspan="2"><div class="cell-row"><span class="lbl">Data de Expedição:</span> <input type="text" name="rgExpedicao" id="f_rgExpedicao" class="table-input" placeholder="00/00/0000"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Carteira Profissional Nº:</span> <input type="text" name="ctpsNumero" id="f_ctpsNumero" class="table-input"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">Série:</span> <input type="text" name="ctpsSerie" id="f_ctpsSerie" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Título Eleitoral:</span> <input type="text" name="tituloEleitoral" class="table-input"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">PIS/PASEP:</span> <input type="text" name="pisPasep" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Cargo (contra-cheque):</span> <input type="text" name="cargoContraCheque" class="table-input"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">Matrícula/Nº Funcional:</span> <input type="text" name="matriculaFuncional" id="f_matriculaFuncional" class="table-input"></div></td>
          </tr>

          <tr>
            <td class="sec" rowspan="2">Filiação:</td>
            <td colspan="5"><div class="cell-row"><span class="lbl">Mãe:</span> <input type="text" name="nomeMae" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Pai:</span> <input type="text" name="nomePai" class="table-input"></div></td>
          </tr>

          <tr>
            <td class="sec" rowspan="3">Endereço<br>Residencial</td>
            <td colspan="3"><div class="cell-row"><span class="lbl">Rua/Av:</span> <input type="text" name="enderecoRua" id="f_enderecoRua" class="table-input"></div></td>
            <td><div class="cell-row"><span class="lbl">Nº:</span> <input type="text" name="enderecoNum" id="f_enderecoNum" class="table-input"></div></td>
            <td><div class="cell-row"><span class="lbl">Aptº:</span> <input type="text" name="enderecoApt" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="2"><div class="cell-row"><span class="lbl">Bairro:</span> <input type="text" name="enderecoBairro" id="f_enderecoBairro" class="table-input"></div></td>
            <td colspan="3"><div class="cell-row"><span class="lbl">CEP:</span> <input type="text" name="cep" id="f_cep" class="table-input" placeholder="00000-000"></div></td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="cell-row">
                <span class="lbl">Tel:</span> <input type="text" name="telefone" id="f_telefone" class="table-input" placeholder="(00) 0000-0000">
                <span class="lbl">Cel:</span> <input type="text" name="telefoneCelular" id="f_telefoneCelular" class="table-input" placeholder="(00) 00000-0000">
              </div>
            </td>
            <td colspan="3"><div class="cell-row"><span class="lbl">e-mail:</span> <input type="text" name="email" id="f_email" class="table-input"></div></td>
          </tr>

          <tr>
            <td class="sec vtop" rowspan="4">Área de<br>Atuação</td>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="anosIniciaisEF"> ( ) Anos Iniciais do Ensino Fundamental:</label> <input type="text" name="anosIniciaisDisc" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="anosFinaisEF"> ( ) Anos Finais do Ensino Fundamental:</label> <input type="text" name="anosFinaisDisc" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="administrativo"> ( ) Administrativo:</label> <input type="text" name="administrativoDesc" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Turno de trabalho:</span> <label><input type="radio" name="turnoTrabalho" value="Matutino"> ( ) Matutino</label> &nbsp; <label><input type="radio" name="turnoTrabalho" value="Vespertino"> ( ) Vespertino</label></div></td>
          </tr>

          <tr>
            <td class="sec vtop" rowspan="9">Situação<br>Funcional<br><span style="font-size:6pt;font-weight:400;">(nesta U.E.)</span></td>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfEstagiario"> ( ) Estagiário</label> &nbsp; <span class="lbl">Carga Horária:</span> <input type="text" name="sfEstagiarioCH" class="table-input" style="width:50pt;"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfDTPMC1"> ( ) DT PMC:</label> <span class="lbl">Disciplinas:</span> <input type="text" name="sfDTPMC_Disc1" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfDTPMC_CH1" class="table-input" style="width:30pt;"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfLocalizado"> ( ) Localizado Provisoriamente:</label> <span class="lbl">Disciplinas:</span> <input type="text" name="sfLocalizadoDisc" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfLocalizadoCH" class="table-input" style="width:30pt;"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Escola(s) de origem:</span> <input type="text" name="sfEscolaOrigem" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfEfetivoPMC"> ( ) Efetivo PMC</label> <label><input type="checkbox" name="sfEstatutario"> ( ) Estatutário</label> <label><input type="checkbox" name="sfCeletista"> ( ) Celetista</label> <span class="lbl">Disc:</span> <input type="text" name="sfEfetivoPMC_Disc" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfEfetivoPMC_CH" class="table-input" style="width:30pt;"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfEfetivoSEDU"> ( ) Efetivo SEDU:</label> <span class="lbl">Disciplinas:</span> <input type="text" name="sfEfetivoSEDU_Disc" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfEfetivoSEDU_CH" class="table-input" style="width:30pt;"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><label><input type="checkbox" name="sfDTPMC2"> ( ) DT PMC:</label> <span class="lbl">Disciplinas:</span> <input type="text" name="sfDTPMC_Disc2" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfDTPMC_CH2" class="table-input" style="width:30pt;"></div></td>
          </tr>
          <tr><td colspan="5" style="font-size:7pt;font-weight:800;">OBS.: Especifique a sua Carga Horária caso complete em outra(s) escola(s):</td></tr>
          <tr>
            <td colspan="5">
              <div class="cell-row"><span class="lbl">Escola:</span> <input type="text" name="sfEscolaComp1" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfEscolaComp1CH" class="table-input" style="width:30pt;"></div>
              <div class="cell-row" style="margin-top:2pt;"><span class="lbl">Escola:</span> <input type="text" name="sfEscolaComp2" class="table-input"> <span class="lbl">CH:</span> <input type="text" name="sfEscolaComp2CH" class="table-input" style="width:30pt;"></div>
            </td>
          </tr>

          <tr>
            <td class="sec vtop" rowspan="11">Escolarização<br>Formação<br>Acadêmica<br><br><span style="font-size:6pt;font-weight:400;">(Especificar<br>cada nível de<br>Ensino)</span></td>
            <td colspan="5"><div class="cell-row"><span class="lbl">Ensino Médio:</span> <input type="text" name="ensinoMedio" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Estudos Adicionais:</span> <input type="text" name="estudosAdicionais" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Curso Superior Concluído:</span> <input type="text" name="cursoSuperiorConcluido" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Ano Início:</span> <input type="text" name="superiorConcluidoInicio" class="table-input" style="width:30pt;"> <span class="lbl">Conclusão:</span> <input type="text" name="superiorConcluidoFim" class="table-input" style="width:30pt;"> <span class="lbl">Inst:</span> <label><input type="radio" name="superiorConcluidoInstTipo" value="Pública"> ( ) Púb.</label> <label><input type="radio" name="superiorConcluidoInstTipo" value="Privada"> ( ) Priv.</label></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Nome da Instituição:</span> <input type="text" name="superiorConcluidoInstNome" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Curso Superior em andamento:</span> <input type="text" name="cursoSuperiorAndamento" class="table-input"></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Ano Início:</span> <input type="text" name="superiorAndamentoInicio" class="table-input" style="width:30pt;"> <span class="lbl">Inst:</span> <label><input type="radio" name="superiorAndamentoInstTipo" value="Pública"> ( ) Púb.</label> <label><input type="radio" name="superiorAndamentoInstTipo" value="Privada"> ( ) Priv.</label></div></td>
          </tr>
          <tr>
            <td colspan="5"><div class="cell-row"><span class="lbl">Nome da Instituição:</span> <input type="text" name="superiorAndamentoInstNome" class="table-input"></div></td>
          </tr>
          <tr>
            <td rowspan="3" style="vertical-align:top;padding-top:2pt;border-right:0.5pt solid #000;width:90pt;">
              <span class="lbl">Pós Graduação:</span><br>
              <label style="display:block;margin-top:2pt;"><input type="radio" name="posGradStatus" value="Concluído"> ( ) Concluído</label>
              <label style="display:block;"><input type="radio" name="posGradStatus" value="Cursando"> ( ) Cursando</label>
            </td>
            <td colspan="4"><div class="cell-row"><span class="lbl">Especialização:</span> <input type="text" name="especializacao" class="table-input"> <span class="lbl">Conclusão:</span> <input type="text" name="especializacaoConclusao" class="table-input" style="width:40pt;"></div></td>
          </tr>
          <tr><td colspan="4"><div class="cell-row"><span class="lbl">Mestrado:</span> <input type="text" name="mestrado" class="table-input"> <span class="lbl">Conclusão:</span> <input type="text" name="mestradoConclusao" class="table-input" style="width:40pt;"></div></td></tr>
          <tr><td colspan="4"><div class="cell-row"><span class="lbl">Doutorado:</span> <input type="text" name="doutorado" class="table-input"> <span class="lbl">Conclusão:</span> <input type="text" name="doutradoConclusao" class="table-input" style="width:40pt;"></div></td></tr>
        </table>

        <div class="outros-titulo">5 - OUTROS CURSOS ESPECÍFICOS (Formação Continuada no mínimo 80 horas - 2019)</div>
        <table class="outros-table">
          <tr>
            <td>
              <label><input type="checkbox" name="fcCreche"> ( ) CRECHE (0 A 3 ANOS)</label>
              <label><input type="checkbox" name="fcAnosFinais"> ( ) ANOS FINAIS ENSINO FUNDAMENTAL</label>
              <label><input type="checkbox" name="fcAnosIniciais"> ( ) ANOS INICIAIS ENSINO FUNDAMENTAL</label>
              <label><input type="checkbox" name="fcEdEspecial"> ( ) EDUCAÇÃO ESPECIAL</label>
              <label><input type="checkbox" name="fcEdAmbiental"> ( ) EDUCAÇÃO AMBIENTAL</label>
            </td>
            <td>
              <label><input type="checkbox" name="fcPreEscola"> ( ) PRÉ-ESCOLA (4 E 5 ANOS)</label>
              <label><input type="checkbox" name="fcEnsinoMedio"> ( ) ENSINO MÉDIO</label>
              <label><input type="checkbox" name="fcEdIndigena"> ( ) EDUCAÇÃO INDÍGENA</label>
              <label><input type="checkbox" name="fcDirHumanos"> ( ) EDUCAÇÃO EM DIREITOS HUMANOS</label>
              <label><input type="checkbox" name="fcRelacoes"> ( ) ED. RELAÇÕES ÉTNICO-RACIAIS</label>
            </td>
            <td>
              <label><input type="checkbox" name="fcEJA"> ( ) EDUCAÇÃO DE JOVENS E ADULTOS</label>
              <label><input type="checkbox" name="fcEdCampo"> ( ) EDUCAÇÃO DO CAMPO</label>
              <label><input type="checkbox" name="fcGenero"> ( ) GÊNERO E DIVERSIDADE SEXUAL</label>
              <label><input type="checkbox" name="fcOutros"> ( ) OUTROS</label>
              <label><input type="checkbox" name="fcNenhum"> ( ) NENHUM</label>
            </td>
          </tr>
        </table>

        <div class="rodape-bemvindo">Seja bem-vindo(a)! Você é um(a) integrante do grupo de profissionais desta escola.</div>

        <div style="display:flex;justify-content:space-between;margin-top:20pt;padding:0 10pt;">
          <div style="font-size:8pt;">Colatina-ES, ______ de ________________ de 2026.</div>
          <div style="text-align:center;">
            <div style="width:150pt;border-bottom:0.5pt solid #000;margin-bottom:2pt;"></div>
            <div style="font-size:7pt;font-weight:800;">Assinatura do Profissional</div>
          </div>
          <div style="text-align:center;">
            <div style="width:150pt;border-bottom:0.5pt solid #000;margin-bottom:2pt;"></div>
            <div style="font-size:7pt;font-weight:800;">Assinatura da Direção</div>
          </div>
        </div>
      </div>
    </div>
  `;

  body.innerHTML = "";
  const fragment = document.createRange().createContextualFragment(html);
  body.appendChild(fragment);

  function updateScale() {
    const scaleWrapper = document.getElementById("ficha-scale-wrapper");
    const container = document.getElementById("ficha-container");
    if (!scaleWrapper || !container) return;

    const winWidth = window.innerWidth;
    
    // Se for mobile muito pequeno (celular), usamos o layout empilhado via CSS (sem scale)
    if (winWidth <= 600) {
      container.style.transform = "none";
      scaleWrapper.style.height = "auto";
      return;
    }

    const availableWidth = winWidth - 30;
    const containerWidth = 794; // 210mm aprox.
    
    if (availableWidth < containerWidth) {
      const scale = availableWidth / containerWidth;
      container.style.transform = `scale(${scale})`;
      scaleWrapper.style.height = (container.offsetHeight * scale) + "px";
    } else {
      container.style.transform = "none";
      scaleWrapper.style.height = "auto";
    }
  }

  window.addEventListener("resize", updateScale);
  setTimeout(updateScale, 200);

  const masks = { f_cpf: "cpf", f_cep: "cep", f_telefoneCelular: "telefone", f_telefone: "telefone" };
  Object.entries(masks).forEach(([id, type]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => applyMask(el, type));
  });

  // Enable unchecking radio buttons (toggle behavior)
  const radios = body.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.addEventListener("click", function() {
      if (this.dataset.wasChecked === "true") {
        this.checked = false;
        this.dataset.wasChecked = "false";
        // Dispatch input event to trigger auto-save and progress update
        this.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // Reset other radios in the same group
        const group = body.querySelectorAll(`input[name="${this.name}"]`);
        group.forEach(r => r.dataset.wasChecked = "false");
        this.dataset.wasChecked = "true";
      }
    });
  });
}

// ─── Popular Formulário ───────────────────────────────────────────────────────
function populateFichaForm(data) {
  if (!data) return;
  const form = document.getElementById("fichaForm");
  
  for (const key in data) {
    const el = form.querySelector(`[name="${key}"]`);
    if (!el) continue;
    
    if (el.type === "checkbox") {
      el.checked = !!data[key];
    } else if (el.type === "radio") {
      const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
      if (radio) {
        radio.checked = true;
        radio.dataset.wasChecked = "true";
      }
    } else {
      el.value = data[key] || "";
    }
  }
}

// ─── Read Data ────────────────────────────────────────────────────────────────
function readFichaData() {
  const form = document.getElementById("fichaForm");
  const data = {};
  const inputs = form.querySelectorAll("input, select, textarea");
  
  inputs.forEach(input => {
    if (!input.name) return;
    if (input.type === "checkbox") {
      data[input.name] = input.checked;
    } else if (input.type === "radio") {
      if (!data.hasOwnProperty(input.name)) data[input.name] = "";
      if (input.checked) data[input.name] = input.value;
    } else {
      data[input.name] = input.value.trim();
    }
  });
  
  return data;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function updateProgress() {
  const data = readFichaData();
  const required = ["nomeCompleto", "cpf", "rg", "rgEmissor", "rgExpedicao", "dataNascimento", "naturalidade", "enderecoRua", "enderecoNum", "enderecoBairro", "cep", "telefoneCelular", "email", "ctpsNumero", "ctpsSerie", "matriculaFuncional"];
  
  let filled = 0;
  required.forEach(key => {
    if (data[key]) filled++;
  });

  const pct = Math.round((filled / required.length) * 100);
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressPct").textContent = pct + "%";
  updateConfirmBar();
}

// ─── Confirm Bar ──────────────────────────────────────────────────────────────
function updateConfirmBar() {
  const docCount = Object.values(uploadedDocs).reduce((acc, arr) => acc + arr.length, 0);
  const confirmBarTitle = document.getElementById("confirmBarTitle");
  const confirmBarSubtitle = document.getElementById("confirmBarSubtitle");
  const btnConfirm = document.getElementById("btnConfirm");

  if (!confirmBarTitle || !confirmBarSubtitle || !btnConfirm) return;

  if (currentTab === "ficha") {
    confirmBarTitle.textContent = "Salvar e confirmar Ficha Funcional";
    confirmBarSubtitle.textContent = "Revise todos os campos antes de confirmar.";
    btnConfirm.textContent = "✅ Confirmar Ficha";
  } else {
    confirmBarTitle.textContent = `${docCount} documento(s) enviado(s)`;
    confirmBarSubtitle.textContent = "Clique para confirmar o envio dos documentos.";
    btnConfirm.textContent = "✅ Confirmar Documentos";
  }
}

// ─── Baixar PDF ───────────────────────────────────────────────────────────────
async function baixarPDF() {
  const btn = document.getElementById("btnPDF");
  btn.disabled = true;
  btn.textContent = "⏳ Gerando...";
  try {
    const data = readFichaData();
    await gerarFichaPDF(teacher.name, data);
  } catch (e) {
    showToast("❌ Erro ao gerar PDF: " + e.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "⬇️ Baixar PDF";
  }
}

// ─── Auto-save ────────────────────────────────────────────────────────────────
async function autoSave() {
  try {
    const data = readFichaData();
    await saveFichaDraft(teacherId, data);
  } catch (e) { console.error("Auto-save error:", e); }
}

// ─── Confirm Submit ───────────────────────────────────────────────────────────
async function confirmSubmit() {
  const btn = document.getElementById("btnConfirm");
  btn.disabled = true;

  if (currentTab === "ficha") {
    const data = readFichaData();
    const required = ["nomeCompleto", "cpf", "rg", "rgEmissor", "rgExpedicao", "dataNascimento", "naturalidade", "enderecoRua", "enderecoNum", "enderecoBairro", "cep", "telefoneCelular", "email", "ctpsNumero", "ctpsSerie", "matriculaFuncional"];

    let valid = true;
    required.forEach(key => {
      const el = document.getElementById(`f_${key}`);
      if (!data[key]) {
        if (el) el.classList.add("invalid");
        valid = false;
      } else {
        if (el) el.classList.remove("invalid");
      }
    });

    if (!valid) {
      showToast("⚠️ Preencha todos os campos obrigatórios em destaque.", "error");
      btn.disabled = false;
      const first = document.querySelector(".invalid");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      await saveFicha(teacherId, data);
      updateHeaderStatus("submitted");
      showToast("✅ Ficha funcional enviada com sucesso!", "success");
    } catch (e) {
      showToast("❌ Erro ao salvar: " + e.message, "error");
    }
  } else {
    const total = Object.values(uploadedDocs).reduce((acc, arr) => acc + arr.length, 0);
    if (total === 0) {
      showToast("⚠️ Nenhum documento foi enviado ainda.", "error");
    } else {
      showToast(`✅ ${total} documento(s) confirmado(s)!`, "success");
    }
  }

  btn.disabled = false;
  updateProgress();
}

// ─── Header Status ────────────────────────────────────────────────────────────
function updateHeaderStatus(status) {
  const el = document.getElementById("headerStatus");
  if (status === "submitted") { el.className = "status-badge status-done"; el.textContent = "✅ Enviado"; }
  else if (status === "draft") { el.className = "status-badge status-partial"; el.textContent = "🔄 Rascunho"; }
  else { el.className = "status-badge status-pending"; el.textContent = "⏳ Pendente"; }
}

// ─── Build Doc Categories ─────────────────────────────────────────────────────
function buildDocCategories() {
  const container = document.getElementById("docCategories");
  if (!container) return;
  container.innerHTML = "";

  REQUIRED_DOCS.forEach(doc => {
    const files = uploadedDocs[doc.id] || [];
    const hasFile = files.length > 0;
    const cat = document.createElement("div");
    cat.className = `doc-category${hasFile ? " has-file" : ""}`;
    cat.id = `cat_${doc.id}`;
    cat.innerHTML = `
      <div class="doc-cat-header" onclick="toggleDocCat('${doc.id}')">
        <span class="doc-cat-icon"><i data-lucide="${getDocIcon(doc.id)}"></i></span>
        <span class="doc-cat-label">${doc.label}</span>
        <span class="doc-cat-status ${hasFile ? "ok" : "none"}">${hasFile ? `<i data-lucide="check-circle-2" style="width:14px;display:inline-block;vertical-align:middle;"></i> ${files.length} arquivo(s)` : "Não enviado"}</span>
        <span style="margin-left:.5rem;color:var(--text-muted);font-size:1rem;"><i data-lucide="chevron-down"></i></span>
      </div>
      <div class="doc-cat-body">
        <ul class="doc-file-list" id="fileList_${doc.id}"></ul>
        <div class="upload-zone" id="zone_${doc.id}">
          <div class="upload-icon"><i data-lucide="upload-cloud"></i></div>
          <p><strong>Arraste ou clique</strong> para enviar</p>
          <p style="font-size:.8rem;margin-top:.25rem;color:var(--text-dim);">PDF, JPG, PNG, DOCX (max 20MB)</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" multiple
                 onchange="handleFileUpload(event, '${doc.id}', '${doc.label}')" />
        </div>
      </div>
    `;
    container.appendChild(cat);
    renderFileList(doc.id);
    setupDragDrop(doc.id, doc.label);
  });
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function getDocIcon(id) {
  const map = { rg: "credit-card", cpf: "file-text", comprovante: "home", diploma: "graduation-cap", foto: "camera", antecedentes: "clipboard-list", outros: "more-horizontal" };
  return map[id] || "file";
}

function toggleDocCat(docId) {
  document.getElementById(`cat_${docId}`).classList.toggle("open");
}

function setupDragDrop(docId, docLabel) {
  const zone = document.getElementById(`zone_${docId}`);
  zone.addEventListener("dragover",  (e) => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", ()  => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault(); zone.classList.remove("dragover");
    handleFilesArray(Array.from(e.dataTransfer.files), docId, docLabel);
  });
}

async function handleFileUpload(event, docId, docLabel) {
  await handleFilesArray(Array.from(event.target.files), docId, docLabel);
  event.target.value = "";
}

async function handleFilesArray(files, docId, docLabel) {
  if (!files.length) return;
  const zone = document.getElementById(`zone_${docId}`);
  zone.style.opacity = "0.5";
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) { showToast(`⚠️ ${file.name} excede 20MB.`, "error"); continue; }
    try {
      const record = await saveDocument(teacherId, docId, docLabel, file);
      if (!uploadedDocs[docId]) uploadedDocs[docId] = [];
      uploadedDocs[docId].push(record);
    } catch (e) { showToast(`❌ Erro ao salvar ${file.name}`, "error"); }
  }
  zone.style.opacity = "1";
  renderFileList(docId);
  updateCategoryState(docId);
  updateConfirmBar();
  showToast(`📁 ${files.length} arquivo(s) adicionado(s)!`, "success");
}

function renderFileList(docId) {
  const list = document.getElementById(`fileList_${docId}`);
  if (!list) return;
  const files = uploadedDocs[docId] || [];
  list.innerHTML = "";
  files.forEach(f => {
    const li = document.createElement("li");
    li.className = "doc-file-item";
    li.innerHTML = `
      <i data-lucide="file" style="width:14px;"></i>
      <span class="doc-file-name">${f.fileName}</span>
      <span class="doc-file-size">${formatSize(f.fileSize)}</span>
      <button class="doc-del-btn" onclick="removeDoc('${docId}', ${f.id})" title="Remover"><i data-lucide="trash-2"></i></button>
    `;
    list.appendChild(li);
  });
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function updateCategoryState(docId) {
  const cat = document.getElementById(`cat_${docId}`);
  const files = uploadedDocs[docId] || [];
  const hasFile = files.length > 0;
  cat.classList.toggle("has-file", hasFile);
  const statusEl = cat.querySelector(".doc-cat-status");
  if (statusEl) {
    statusEl.className = `doc-cat-status ${hasFile ? "ok" : "none"}`;
    statusEl.innerHTML = hasFile ? `<i data-lucide="check-circle-2" style="width:14px;display:inline-block;vertical-align:middle;"></i> ${files.length} arquivo(s)` : "Não enviado";
  }
  if (typeof lucide !== "undefined") lucide.createIcons();
}

async function removeDoc(docId, docDbId) {
  try {
    await deleteDocument(docDbId);
    uploadedDocs[docId] = (uploadedDocs[docId] || []).filter(f => f.id !== docDbId);
    renderFileList(docId);
    updateCategoryState(docId);
    updateConfirmBar();
    showToast("🗑 Documento removido.", "default");
  } catch (e) { showToast("❌ Erro ao remover documento.", "error"); }
}

// ─── Utils ─────────────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function applyMask(el, mask) {
  let v = el.value.replace(/\D/g, "");
  if (mask === "cpf") {
    v = v.slice(0, 11)
         .replace(/(\d{3})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else if (mask === "cep") {
    v = v.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  } else if (mask === "telefone") {
    v = v.slice(0, 11);
    if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
  el.value = v;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = "default") {
  const c = document.getElementById("toast-container");
  if (!c) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

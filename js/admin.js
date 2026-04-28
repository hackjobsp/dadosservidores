// ─── Admin Dashboard Logic ────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Cruzeiro";

let allTeachers = [];
let fichaMap = {};
let docMap = {};
let currentFilter = "all";
let currentModalTeacherId = null;
let currentModalTab = "ficha";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function checkGuard() {
  const pass = document.getElementById("guardPassInput").value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminAuth", "1");
    document.getElementById("authGuard").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    loadDashboard();
  } else {
    document.getElementById("guardError").style.display = "block";
    document.getElementById("guardPassInput").value = "";
    document.getElementById("guardPassInput").focus();
  }
}

async function init() {
  try {
    if (sessionStorage.getItem("adminAuth") === "1") {
      document.getElementById("authGuard").style.display = "none";
      document.getElementById("adminContent").style.display = "block";
      await loadDashboard();
    } else {
      document.getElementById("authGuard").style.display = "flex";
      setTimeout(() => document.getElementById("guardPassInput").focus(), 200);
    }
  } catch (err) {
    console.error("Erro na inicialização do Admin:", err);
    showToast("⚠️ Erro ao carregar painel administrativo.", "error");
  } finally {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      if (!loader.classList.contains("hidden")) {
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 500);
      }
    }
    lucide.createIcons();
  }
}

async function loadDashboard() {
  await openDB();
  const stats = await getStats();
  allTeachers = stats.teachers || [];
  fichaMap = stats.fichaMap;
  docMap = stats.docMap;

  renderKPIs();
  renderCharts();
  renderTimeline();
  renderAdminGrid(allTeachers);
}

async function refreshAll() {
  await loadDashboard();
  showToast("🔄 Dados atualizados!", "success");
}

// ─── KPIs ───────────────────────────────────────────────────────────────────
function renderKPIs() {
  const submitted = Object.values(fichaMap).filter(f => f.status === "submitted").length;
  const drafts = Object.values(fichaMap).filter(f => f.status === "draft").length;
  const totalDocs = Object.values(docMap).reduce((acc, arr) => acc + arr.length, 0);
  const pending = allTeachers.length - submitted;

  const stats = [
    { icon: "users", value: allTeachers.length, label: "Total de Servidores" },
    { icon: "check-circle", value: submitted, label: "Fichas Enviadas", color: "var(--success)" },
    { icon: "refresh-cw", value: drafts, label: "Em Rascunho", color: "var(--info)" },
    { icon: "clock", value: pending, label: "Fichas Pendentes", color: "var(--warning)" },
    { icon: "folder", value: totalDocs, label: "Total de Docs" },
  ];

  const row = document.getElementById("statsRow");
  const html = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon"><i data-lucide="${s.icon}"></i></div>
      <div class="stat-value" style="${s.color ? "color:" + s.color : ""}">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join("");
  
  row.innerHTML = "";
  row.appendChild(document.createRange().createContextualFragment(html));
  lucide.createIcons();
}

// ─── Charts ────────────────────────────────────────────────────────────────────
let charts = {};

function renderCharts() {
  const submitted = Object.values(fichaMap).filter(f => f.status === "submitted").length;
  const drafts = Object.values(fichaMap).filter(f => f.status === "draft").length;
  const pending = allTeachers.length - submitted - drafts;

  // Destroy existing
  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  const chartDefaults = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "rgba(240,244,255,0.75)", font: { family: "Inter", size: 12 } }
      }
    }
  };

  // Chart 1 — Donut: fichas status
  charts.fichas = new Chart(document.getElementById("chartFichas"), {
    type: "doughnut",
    data: {
      labels: ["Enviadas", "Rascunho", "Pendentes"],
      datasets: [{
        data: [submitted, drafts, pending],
        backgroundColor: ["rgba(34,197,94,0.85)", "rgba(59,130,246,0.85)", "rgba(245,158,11,0.85)"],
        borderColor: "#0b0e2a",
        borderWidth: 3,
      }]
    },
    options: {
      ...chartDefaults,
      cutout: "65%",
      plugins: { ...chartDefaults.plugins }
    }
  });

  // Chart 2 — Bar: docs per teacher (top 10)
  const docCounts = allTeachers.map(t => ({
    name: t.name.split(" ")[0] + " " + (t.name.split(" ")[1] || ""),
    count: (docMap[t.id] || []).length
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 10);

  charts.docs = new Chart(document.getElementById("chartDocs"), {
    type: "bar",
    data: {
      labels: docCounts.map(x => x.name),
      datasets: [{
        label: "Documentos",
        data: docCounts.map(x => x.count),
        backgroundColor: "rgba(240,165,0,0.75)",
        borderColor: "rgba(240,165,0,1)",
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      ...chartDefaults,
      indexAxis: "y",
      scales: {
        x: { ticks: { color: "rgba(240,244,255,0.55)" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "rgba(240,244,255,0.75)", font: { size: 11 } }, grid: { display: false } }
      },
      plugins: { ...chartDefaults.plugins, legend: { display: false } }
    }
  });

  // Chart 3 — Horizontal bar: overall delivery status per teacher
  const statusData = [
    submitted,
    drafts,
    pending
  ];

  charts.status = new Chart(document.getElementById("chartStatus"), {
    type: "bar",
    data: {
      labels: ["Fichas Enviadas", "Em Rascunho", "Pendentes"],
      datasets: [{
        data: statusData,
        backgroundColor: [
          "rgba(34,197,94,0.8)",
          "rgba(59,130,246,0.8)",
          "rgba(245,158,11,0.8)"
        ],
        borderRadius: 8,
        borderWidth: 0,
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        x: { ticks: { color: "rgba(240,244,255,0.55)" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "rgba(240,244,255,0.55)" }, grid: { display: false }, beginAtZero: true }
      },
      plugins: { ...chartDefaults.plugins, legend: { display: false } }
    }
  });
}

// ─── Timeline ───────────────────────────────────────────────────────────────
function renderTimeline() {
  const events = [];
  
  // Fichas (Submissões e Rascunhos)
  Object.values(fichaMap).forEach(f => {
    const t = allTeachers.find(x => x.id == f.teacherId);
    if (!t) return;
    
    if (f.status === 'submitted' && f.submittedAt) {
      events.push({ 
        name: t.name, 
        time: new Date(f.submittedAt), 
        type: "ficha", 
        status: "submitted",
        label: "enviou a ficha funcional" 
      });
    } else if (f.status === 'draft' && f.updatedAt) {
      events.push({ 
        name: t.name, 
        time: new Date(f.updatedAt), 
        type: "ficha", 
        status: "draft",
        label: "atualizou o rascunho da ficha" 
      });
    }
  });

  // Documentos
  Object.values(docMap).flat().forEach(d => {
    const t = TEACHERS.find(x => x.id == d.teacherId);
    if (t && d.uploadedAt) {
      events.push({ 
        name: t.name, 
        time: new Date(d.uploadedAt), 
        type: "doc", 
        label: `enviou o documento: <strong>${d.docLabel}</strong>` 
      });
    }
  });

  events.sort((a, b) => b.time - a.time);
  const recent = events.slice(0, 15);

  const list = document.getElementById("timelineList");
  if (recent.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><div class="empty-icon">📭</div><p>Nenhuma atividade recente.</p></div>`;
    return;
  }

  const html = recent.map(ev => {
    let icon = 'file-text';
    let color = 'var(--accent)';
    if (ev.type === 'ficha') {
      icon = ev.status === 'submitted' ? 'check-circle' : 'edit-3';
      color = ev.status === 'submitted' ? 'var(--success)' : 'var(--info)';
    }

    return `
      <div class="timeline-item" style="display:flex; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); transition: background 0.2s; border-radius: 4px;">
        <div class="timeline-icon" style="color:${color}; background: rgba(255,255,255,0.03); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <i data-lucide="${icon}" style="width: 16px; height: 16px;"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.85rem; color:#fff; line-height: 1.4;">
            <strong style="color: var(--primary-light);">${ev.name}</strong> ${ev.label}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="clock" style="width: 10px; height: 10px;"></i>
            ${timeAgo(ev.time)} • ${formatDate(ev.time)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  list.innerHTML = "";
  list.appendChild(document.createRange().createContextualFragment(html));
  lucide.createIcons();
}

// ─── Admin Grid ────────────────────────────────────────────────────────────────
function renderAdminGrid(list) {
  const grid = document.getElementById("adminGrid");
  const empty = document.getElementById("adminEmpty");
  grid.innerHTML = "";

  const filtered = list.filter(t => {
    const ficha = fichaMap[t.id];
    const docs = docMap[t.id] || [];
    const fichaOk = ficha && ficha.status === "submitted";
    if (currentFilter === "done") return fichaOk && docs.length > 0;
    if (currentFilter === "partial") return (ficha && !fichaOk) || (docs.length > 0 && !fichaOk);
    if (currentFilter === "pending") return !ficha && docs.length === 0;
    return true;
  });

  if (filtered.length === 0) { empty.style.display = "block"; return; }
  empty.style.display = "none";

  filtered.forEach(t => {
    const ficha = fichaMap[t.id];
    const docs = docMap[t.id] || [];
    const fichaOk = ficha && ficha.status === "submitted";
    const hasDraft = ficha && ficha.status === "draft";

    let statusBadges = "";
    if (fichaOk) {
      statusBadges += `<span class="status-badge status-done">📝 Ficha ✅</span>`;
    } else if (hasDraft) {
      statusBadges += `<span class="status-badge status-partial">📝 Rascunho</span>`;
    } else {
      statusBadges += `<span class="status-badge status-pending">📝 Pendente</span>`;
    }
    if (docs.length > 0) {
      statusBadges += `<span class="status-badge status-partial">📂 ${docs.length} doc(s)</span>`;
    } else {
      statusBadges += `<span class="status-badge status-pending">📂 Sem docs</span>`;
    }

    const folder = document.createElement("div");
    folder.className = "teacher-card teacher-folder-item admin-folder";
    folder.innerHTML = `
      <div class="folder-container folder-main">
        <div class="folder">
          <div class="folder-paper">
            <div class="paper-line"></div>
            <div class="paper-line"></div>
            <div class="paper-line short"></div>
          </div>
          <div class="folder-front"></div>
        </div>
      </div>
      <div class="teacher-name teacher-folder-name">${t.name}</div>
      <div class="folder-badges" style="margin-top:10px;">${statusBadges}</div>
    `;
    folder.addEventListener("click", () => openTeacherModal(t.id));
    grid.appendChild(folder);
  });
  lucide.createIcons();
}

function filterAdmin() {
  const q = document.getElementById("adminSearch").value.toLowerCase().trim();
  const filtered = allTeachers.filter(t => t.name.toLowerCase().includes(q));
  renderAdminGrid(filtered);
  lucide.createIcons();
}

function setFilter(f) {
  currentFilter = f;
  ["all", "done", "partial", "pending"].forEach(k => {
    document.getElementById(`chip_${k}`).classList.toggle("active", k === f);
  });
  filterAdmin();
}

// ─── Teacher Modal ─────────────────────────────────────────────────────────────
async function openTeacherModal(teacherId) {
  currentModalTeacherId = teacherId;
  const teacher = allTeachers.find(t => t.id == teacherId);
  document.getElementById("modalTeacherName").textContent = teacher.name;

  // Ficha preview
  const ficha = fichaMap[teacherId];
  const fichaContent = document.getElementById("fichaPreviewContent");
  if (!ficha || !ficha.data) {
    fichaContent.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>Ficha ainda não enviada.</p></div>`;
    document.getElementById("btnDownloadFicha").disabled = true;
  } else {
    document.getElementById("btnDownloadFicha").disabled = false;
    fichaContent.innerHTML = buildFichaPreview(ficha.data);
  }

  // Docs
  const docs = docMap[teacherId] || [];
  const docsArea = document.getElementById("docsAdminList");
  if (docs.length === 0) {
    docsArea.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum documento enviado.</p></div>`;
  } else {
    docsArea.innerHTML = docs.map(d => `
      <div class="doc-item-admin">
        <span>📄</span>
        <div style="flex:1;overflow:hidden;">
          <div class="doc-name">${d.fileName}</div>
          <div class="doc-type-label">${d.docLabel} · ${formatSize(d.fileSize)} · ${formatDate(new Date(d.uploadedAt))}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="downloadDocAdmin(${d.id})">⬇️ Baixar</button>
      </div>
    `).join("");
  }

  switchModalTab("ficha");
  document.getElementById("teacherModal").style.display = "flex";
}

function buildFichaPreview(data) {
  let html = '<div class="ficha-preview">';
  Object.keys(FICHA_FIELDS).forEach(sKey => {
    const section = FICHA_FIELDS[sKey];
    html += `<div class="ficha-section-preview" style="margin-bottom:20px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:15px; background:rgba(255,255,255,0.02);">
      <h4 style="margin-bottom:12px; color:var(--primary-light); display:flex; align-items:center; gap:8px; font-size:1rem;">
        ${section.title}
      </h4>
      <div class="ficha-fields-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">`;
    section.fields.forEach(field => {
      const val = data[field.id] || "—";
      html += `
        <div class="ficha-field-row" style="padding:5px 0;">
          <div class="field-label" style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">${field.label}</div>
          <div class="field-val" style="font-size:0.85rem; color:#fff; border-bottom:1px solid rgba(255,255,255,0.05);">${val === true ? "✅ Sim" : (val === false ? "❌ Não" : val)}</div>
        </div>`;
    });
    html += `</div></div>`;
  });
  html += "</div>";
  return html;
}

function switchModalTab(tab) {
  currentModalTab = tab;
  document.getElementById("mTabFicha").classList.toggle("active", tab === "ficha");
  document.getElementById("mTabDocs").classList.toggle("active", tab === "docs");
  document.getElementById("mPanelFicha").classList.toggle("active", tab === "ficha");
  document.getElementById("mPanelDocs").classList.toggle("active", tab === "docs");
}

function closeModal() {
  document.getElementById("teacherModal").style.display = "none";
  currentModalTeacherId = null;
}

async function downloadDocAdmin(docId) {
  // Load fresh from DB and convert/download as PDF
  const allDocs = await getAllDocuments();
  const rec = allDocs.find(d => d.id === docId);
  if (!rec) { showToast("❌ Documento não encontrado.", "error"); return; }
  showToast("⏳ Gerando PDF...");
  await docToPDF(rec);
  showToast("✅ PDF baixado com sucesso!", "success");
}

async function downloadCurrentFicha() {
  if (!currentModalTeacherId) return;
  const teacher = allTeachers.find(t => t.id == currentModalTeacherId);
  const ficha = fichaMap[currentModalTeacherId];
  if (!ficha || !ficha.data) { showToast("⚠️ Ficha sem dados preenchidos.", "error"); return; }
  const btn = document.getElementById("btnDownloadFicha");
  btn.disabled = true;
  btn.textContent = "⏳ Gerando PDF...";
  try {
    await gerarFichaPDF(teacher.name, ficha.data);
    showToast("✅ Ficha PDF gerada com sucesso!", "success");
  } catch(e) {
    console.error(e);
    showToast("❌ Erro ao gerar PDF: " + e.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📄 Baixar Ficha PDF";
  }
}

async function downloadAllDocs() {
  if (!currentModalTeacherId) return;
  const allDocs = await getAllDocuments();
  const teacherDocs = allDocs.filter(d => d.teacherId === currentModalTeacherId);
  if (!teacherDocs.length) { showToast("⚠️ Nenhum documento para baixar.", "error"); return; }
  showToast(`⏳ Baixando ${teacherDocs.length} documento(s) em PDF...`);
  for (const rec of teacherDocs) {
    await docToPDF(rec);
    await new Promise(r => setTimeout(r, 400)); // small delay between downloads
  }
  showToast("✅ Todos os documentos baixados!", "success");
}

// ─── Export Report ─────────────────────────────────────────────────────────────
function exportReport() {
  const rows = [["ID", "Nome", "Status Ficha", "Data Envio", "Nº Docs"]];
  allTeachers.forEach(t => {
    const ficha = fichaMap[t.id];
    const docs = docMap[t.id] || [];
    rows.push([
      t.id,
      t.name,
      ficha ? ficha.status : "pendente",
      ficha && ficha.submittedAt ? ficha.submittedAt.slice(0, 10) : "—",
      docs.length
    ]);
  });
  const csv = rows.map(r => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Relatorio_Ficha_Funcional_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("📥 Relatório exportado!", "success");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + 
         d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  return formatDate(date);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = "default") {
  const c = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── Close modal on outside click ─────────────────────────────────────────────
document.addEventListener("click", (e) => {
  if (e.target.id === "teacherModal") closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

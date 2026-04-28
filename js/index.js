// ─── Index Page Logic ─────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Cruzeiro";

let currentTeachers = [];
let allTeacherData = {}; // { teacherId: { fichaStatus, docCount } }

async function init() {
  console.log("Iniciando página index...");
  try {
    // 1. Carregar professores do Banco de Dados
    currentTeachers = await getTeachers();
    
    // 2. Carregar estatísticas (fichas e documentos)
    await loadStats();
    
  } catch (e) {
    console.error("Erro durante a inicialização:", e);
  } finally {
    renderGrid(currentTeachers);
  }

  // Hide loader
  const loader = document.getElementById("pageLoader");
  if (loader) { loader.classList.add("hidden"); setTimeout(() => loader.remove(), 500); }

  lucide.createIcons();
}

async function loadStats() {
  const { fichaMap, docMap } = await getStats();
  let doneCount = 0;
  let totalDocs = 0;

  currentTeachers.forEach(t => {
    const ficha = fichaMap[t.id];
    const docs  = docMap[t.id] || [];
    const fichaOk = ficha && ficha.status === "submitted";
    if (fichaOk) doneCount++;
    totalDocs += docs.length;
    allTeacherData[t.id] = { fichaStatus: ficha ? ficha.status : null, docCount: docs.length };
  });

  document.getElementById("statTotal").textContent   = currentTeachers.length;
  document.getElementById("statDone").textContent    = doneCount;
  document.getElementById("statDocs").textContent    = totalDocs;
  document.getElementById("statPending").textContent = currentTeachers.length - doneCount;
}

function renderGrid(list) {
  const grid  = document.getElementById("teachersGrid");
  const empty = document.getElementById("emptyState");
  grid.innerHTML = "";

  if (list.length === 0) { empty.style.display = "block"; return; }
  empty.style.display = "none";

  list.forEach(teacher => {
    const data = allTeacherData[teacher.id] || {};
    const fichaStatus = data.fichaStatus;
    const docCount    = data.docCount || 0;

    let badge = "";
    if (fichaStatus === "submitted" && docCount > 0) {
      badge = `<span class="status-badge status-done">✅ Completo</span>`;
    } else if (fichaStatus === "submitted" || fichaStatus === "draft" || docCount > 0) {
      badge = `<span class="status-badge status-partial">🔄 Parcial</span>`;
    } else {
      badge = `<span class="status-badge status-pending">⏳ Pendente</span>`;
    }

    const card = document.createElement("div");
    card.className = "teacher-card teacher-folder-item";
    
    const html = `
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
      <div class="teacher-name teacher-folder-name">${teacher.name}</div>
      <div class="teacher-id">#${String(teacher.id).padStart(2, "0")}</div>
      ${badge}
    `;
    
    card.appendChild(document.createRange().createContextualFragment(html));
    card.addEventListener("click", () => {
      // Feedback imediato
      card.style.transform = "scale(0.95)";
      card.style.opacity = "0.7";
      openTeacher(teacher.id, teacher.name);
    });
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function filterTeachers() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtered = currentTeachers.filter(t => t.name.toLowerCase().includes(q));
  
  // Se não encontrar nada, mostrar sugestão de criar pasta
  const createSugg = document.getElementById("createSuggestion");
  if (filtered.length === 0 && q.length > 2) {
    createSugg.style.display = "block";
    document.getElementById("newTeacherName").textContent = q.toUpperCase();
  } else {
    createSugg.style.display = "none";
  }

  renderGrid(filtered);
}

// Criar pasta diretamente pelo botão
async function handleCreateFolderDirect() {
  const name = prompt("Digite o seu nome completo para criar sua pasta de Servidor:");
  if (!name || name.trim().length < 5) {
    if (name) showToast("⚠️ Por favor, digite seu nome completo.", "warning");
    return;
  }
  await _createTeacherLogic(name.trim());
}

async function handleCreateFolder() {
  const q = document.getElementById("searchInput").value.trim();
  if (q.length < 5) {
    showToast("⚠️ Por favor, digite seu nome completo.", "warning");
    return;
  }
  await _createTeacherLogic(q);
}

async function _createTeacherLogic(name) {
  try {
    showToast("📂 Criando sua pasta...", "default");
    const result = await createTeacher(name);
    if (result.error === "duplicate") {
      showToast("❌ Esta pasta já existe! Busque novamente.", "warning");
    } else if (result.id) {
      showToast("✅ Pasta criada com sucesso!", "success");
      setTimeout(() => {
        window.location.href = `professor.html?id=${result.id}`;
      }, 1000);
    }
  } catch (e) {
    console.error(e);
    showToast("❌ Erro ao criar pasta.", "danger");
  }
}

function openTeacher(id, name) {
  console.log(`Abrindo pasta: ${name} (ID: ${id})`);
  showToast(`📂 Abrindo pasta: ${name}...`, "default");
  
  // Pequeno delay para feedback visual antes da navegação
  setTimeout(() => {
    window.location.href = `professor.html?id=${id}`;
  }, 150);
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function openAdminLogin() {
  document.getElementById("adminLoginModal").style.display = "flex";
  document.getElementById("adminPassInput").value = "";
  document.getElementById("loginError").style.display = "none";
  setTimeout(() => document.getElementById("adminPassInput").focus(), 100);
}

function closeAdminLogin() {
  document.getElementById("adminLoginModal").style.display = "none";
}

function checkAdminPass() {
  const pass = document.getElementById("adminPassInput").value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminAuth", "1");
    window.location.href = "admin.html";
  } else {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("adminPassInput").value = "";
    document.getElementById("adminPassInput").focus();
  }
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

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

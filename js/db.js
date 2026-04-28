// ─── API Connection Wrapper (Replacing IndexedDB) ─────────────────────────
// Usamos caminho relativo para funcionar independente do IP de acesso
// Detectar URL da API (Local ou Produção)
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3001/api' 
    : `${window.location.origin}/api`;
const SERVER_URL = window.location.origin;

// ─── Professores (Pastas) ───────────────────────────────────────────────────
async function getTeachers() {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    return await response.json();
}

async function getTeacher(id) {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`);
    return await response.json();
}

async function createTeacher(name) {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    return await response.json();
}

// Dummy function for compatibility
async function openDB() {
    return true; 
}

// ─── Ficha Funcional ──────────────────────────────────────────────────────────
async function saveFicha(teacherId, data) {
    const response = await fetch(`${API_BASE_URL}/fichas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, data, status: 'submitted' })
    });
    return await response.json();
}

async function saveFichaDraft(teacherId, data) {
    const response = await fetch(`${API_BASE_URL}/fichas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, data, status: 'draft' })
    });
    return await response.json();
}

async function getFicha(teacherId) {
    const response = await fetch(`${API_BASE_URL}/fichas/${teacherId}`);
    return await response.json();
}

async function getAllFichas() {
    const response = await fetch(`${API_BASE_URL}/fichas`);
    return await response.json();
}

// ─── Documentos ───────────────────────────────────────────────────────────────
async function saveDocument(teacherId, docType, docLabel, file) {
    const formData = new FormData();
    formData.append('teacherId', teacherId);
    formData.append('docType', docType);
    formData.append('docLabel', docLabel);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

// Helper para mapear os documentos e adicionar a URL do servidor
function mapDocRecord(d) {
    return {
        ...d,
        data: null, 
        url: `${SERVER_URL}/uploads/${path_basename(d.filePath)}`
    };
}

async function getDocumentsByTeacher(teacherId) {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${teacherId}`);
        if (!response.ok) throw new Error(`Status error: ${response.status}`);
        const docs = await response.json();
        return Array.isArray(docs) ? docs.map(mapDocRecord) : [];
    } catch (e) {
        console.error("Erro ao buscar documentos:", e);
        return [];
    }
}

function path_basename(path) {
    return path.split(/[\\/]/).pop();
}

async function getAllDocuments() {
    try {
        const response = await fetch(`${API_BASE_URL}/documents`);
        const docs = await response.json();
        return Array.isArray(docs) ? docs.map(mapDocRecord) : [];
    } catch (e) {
        console.error("Erro ao buscar docs:", e);
        return [];
    }
}

async function deleteDocument(docId) {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: 'DELETE'
    });
    return await response.json();
}

// ─── Download Helper ──────────────────────────────────────────────────────────
function downloadDocFromRecord(record) {
    const url = record.url || `${SERVER_URL}/uploads/${path_basename(record.filePath)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = record.fileName;
    a.target = "_blank";
    a.click();
}

function downloadFichaAsJSON(teacherName, fichaData) {
    const content = JSON.stringify({ professor: teacherName, ficha: fichaData }, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ficha_${teacherName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Stats Helper ─────────────────────────────────────────────────────────────
async function getStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const stats = await response.json();
        
        // Mapear URLs para os documentos dentro do objeto stats
        if (stats.docMap) {
            Object.keys(stats.docMap).forEach(key => {
                stats.docMap[key] = stats.docMap[key].map(mapDocRecord);
            });
        }
        return stats;
    } catch (e) {
        console.error("Erro ao buscar stats:", e);
        return { fichaMap: {}, docMap: {}, totalFichas: 0, totalDocs: 0 };
    }
}

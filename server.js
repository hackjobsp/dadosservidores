const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// 1. Servir arquivos estáticos PRIMEIRO
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Rota explícita para o início
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Logs para diagnóstico
console.log("Pasta atual:", __dirname);
console.log("Arquivos na pasta:", fs.readdirSync(__dirname));

// Configuración de Multer para uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ─── Rotas de Professores (Pastas) ───────────────────────────────────────────
app.get('/api/teachers', async (req, res) => {
    try {
        const rows = await db.getAllTeachers();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/teachers/:id', async (req, res) => {
    try {
        const row = await db.getTeacherById(req.params.id);
        res.json(row || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/teachers', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Nome é obrigatório." });
        const result = await db.saveTeacher(name);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Rotas de Fichas ─────────────────────────────────────────────────────────

// Salvar Ficha (ou rascunho se status for draft)
app.post('/api/fichas', async (req, res) => {
    try {
        const { teacherId, data, status } = req.body;
        const now = new Date().toISOString();
        const existing = await db.getFicha(teacherId);

        const ficha = {
            teacherId,
            data,
            status: status || 'submitted',
            submittedAt: (existing && existing.submittedAt) ? existing.submittedAt : (status !== 'draft' ? now : null),
            updatedAt: now
        };

        const result = await db.saveFicha(ficha);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/fichas/:teacherId', async (req, res) => {
    try {
        const row = await db.getFicha(req.params.teacherId);
        res.json(row || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/fichas', async (req, res) => {
    try {
        const rows = await db.getAllFichas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Rotas de Documentos ──────────────────────────────────────────────────────

app.post('/api/documents', upload.single('file'), async (req, res) => {
    try {
        const { teacherId, docType, docLabel } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const docRecord = {
            teacherId,
            docType,
            docLabel,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedAt: new Date().toISOString()
        };

        const result = await db.saveDocument(docRecord);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/documents/:teacherId', async (req, res) => {
    try {
        const rows = await db.getDocumentsByTeacher(req.params.teacherId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/documents', async (req, res) => {
    try {
        const rows = await db.getAllDocuments();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        const doc = await db.getDocumentById(req.params.id);
        if (doc && doc.filePath) {
            if (fs.existsSync(doc.filePath)) {
                fs.unlinkSync(doc.filePath);
            }
        }
        await db.deleteDocument(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
    try {
        const [teachers, fichas, docs] = await Promise.all([
            db.getAllTeachers(),
            db.getAllFichas(),
            db.getAllDocuments()
        ]);

        const fichaMap = {};
        fichas.forEach(f => { fichaMap[f.teacherId] = f; });

        const docMap = {};
        docs.forEach(d => {
            if (!docMap[d.teacherId]) docMap[d.teacherId] = [];
            docMap[d.teacherId].push(d);
        });

        res.json({
            teachers,
            fichaMap,
            docMap,
            totalFichas: fichas.length,
            totalDocs: docs.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seeding inicial (Executado uma vez)
async function seedTeachers() {
    try {
        const teachersList = [
            "ADNA MARIA CORNELIO", "ALESSANDRA SIMONE CARNEIRO SIQUEIRA", "ALINE FERREIRA MARIM", "ANA PAULA RIGONI MONTEIRO",
            "ANGELITA ALICE SANTOS", "ANTONIA NILSETE PEREIRA ALVES", "BRUNA SOARES SILVA CAETANO", "CAMILA DE FREITAS COSTA REIS",
            "CARINA AMALIA MOREIRA", "DANIELE APARECIDA PEREIRA DE SOUZA", "DEBORA MARILIA BARAUNA MARIANO", "EDIANA MARA PIVETTA",
            "ELIANA CRISTINA DE ALMEIDA", "ELIANA MARIA DA SILVA", "ELIANE GOMES ANDRADE", "ELIZETE DA SILVA PEREIRA",
            "ERICA PAULA PEREIRA", "ERIKA DE JESUS CABRAL", "FABRICIA CRISTINA DE CARVALHO", "FLAVIA MARA DA SILVA",
            "FRANCISCA MARIA DA CONCEICAO SOUZA", "GILDETE MARIA PEREIRA", "GLAUCIA APARECIDA CALISTA FERREIRA",
            "GRACIELE CRISTINA DE CARVALHO", "INILDA ALICE DA SILVA", "IRACI MARIA DA SILVA", "IRENE MARIA DA SILVA",
            "IZAURA MARIA DA SILVA", "JESSICA CRISTINA DA SILVA", "JOSEFA MARIA DA SILVA", "JULIANA CRISTINA DA SILVA",
            "LEILA CRISTINA DA SILVA", "LILIAN CRISTINA DA SILVA", "LUCIANA CRISTINA DA SILVA", "MARIA CRISTINA DA SILVA",
            "MARIANA CRISTINA DA SILVA", "NATALIA CRISTINA DA SILVA", "PATRICIA CRISTINA DA SILVA", "PRISCILA CRISTINA DA SILVA",
            "RAQUEL CRISTINA DA SILVA", "SIMONE CRISTINA DA SILVA", "TATIANE CRISTINA DA SILVA", "TEREZA CRISTINA DA SILVA",
            "VANESSA CRISTINA DA SILVA", "IRACELI FACHETTI", "JULIANA MACIEL VIEIRA", "MARCIA MARIA DE OLIVEIRA", "ELCIA APARECIDA RAMOS",
            "GABRIEL JESUS DA SILVA", "GABRIEL ROCHA VIANA", "ANGÉLICA DALEPRANE", "WALBER HENRIQUE RANGEL PEREIRA",
            "MARIA IZABEL SILVA ZACHARIAS", "JULIANA FARIAS GARCIA LEAL", "TATIANA CRISTINA AMARAL", "THAÍS ANASTÁCIO FARIAS",
            "ANA SILVA DE OLIVEIRA LOBEU", "ISTAEL DA SILVA COSTA", "DUALCEI GREGORIO BRAGA", "JULIANE GUIMARAES DE ANDRADE MILLI",
            "SUELY SANTOS NUNES", "GABRIEL FELIPE DE MATOS", "ELYKEN DE ALMEIDA MENDONCA SANT ANA", "WALDIR AVANCINI JUNIOR",
            "KARLA PALMEZANI CANDIDO", "CARLA VIEIRA GODINHO", "MARIA ANGELICA CLABUNDE PEREIRA", "RONI JOSÉ SOARES",
            "ALINE ARAUJO VAGO GABRIEL", "ROSIMERI ZANIBONI", "MIGUEL OLIVEIRA BIANCHINI SILVEIRA", "ROSILENE ARAUJO DA SILVA",
            "ROBSON LOPES DE OLIVEIRA", "MONICA DA COSTA COELHO RIBEIRO", "ANGELICA RENATA PRETTI", "ADRIANA ALVES DOS SANTOS VELOZO",
            "MARIA BERNADETE MENEGHELLI DE ALMEIDA", "CAMILA DOS REIS IGLESIAS", "CLAUDIA FALRENE DE CASTRO LOSS", "IDILEUZA TEODORO",
            "GISELIA APARECIDA SILVA FERREIRA", "THAIS DAMASCENO FELIX BARCELLOS", "MARCIA MARIA COZER", "JANETE DA CRUZ DE OLIVEIRA",
            "VALERIANA GON GALLON", "MARIA DO CARMO SILVA", "MARIA CRISTINA DE DEUS SILVA", "LUCIANA BROCCO RICATTO",
            "KENIA MARLUCE TESSAROLO", "KARLA ANDRESSA RAMOS DE MORAES", "JOSIANE CELESTE TOMAZZINI ZENI", "JANAINA KEILA DE PAIVA PERTEL COSTA",
            "GLEISYELLE CIBIEN CORRADINI DONADIA", "CYNTHIA BINDA", "CLAUDIA FABIOLA TEIXEIRA", "CARLOS RENATO RAASCH",
            "ANA CLAUDIA DUBBERSTEIN SCHNEIDER", "ADRIANA MARIA DALLA BERNARDINA PEREIRA"
        ];

        const current = await db.getAllTeachers();
        if (current.length === 0) {
            console.log("Seeding inicial de servidores...");
            for (const name of teachersList) {
                await db.saveTeacher(name);
            }
        }
    } catch (e) {
        console.error("Erro no seeding:", e);
    }
}

// Inicializar e rodar
async function start() {
    try {
        await db.initDB();
        await seedTeachers();
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
            console.log(`Arquivos serão salvos na pasta: ${path.join(__dirname, 'uploads')}`);
        });
    } catch (err) {
        console.error("Erro ao iniciar servidor:", err);
    }
}

start();

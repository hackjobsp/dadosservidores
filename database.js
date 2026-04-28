const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const dbPath = path.resolve(__dirname, 'database.db');
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Erro ao abrir o banco de dados:', err.message);
                reject(err);
            } else {
                console.log('Conectado ao banco de dados SQLite.');
                
                db.serialize(() => {
                    // Tabela de Professores (Pastas)
                    db.run(`CREATE TABLE IF NOT EXISTS teachers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT UNIQUE,
                        createdAt TEXT
                    )`);

                    // Tabela de Fichas Funcionais
                    db.run(`CREATE TABLE IF NOT EXISTS fichas (
                        teacherId TEXT PRIMARY KEY,
                        data TEXT, -- Armazenado como JSON string
                        status TEXT,
                        submittedAt TEXT,
                        updatedAt TEXT
                    )`);

                    // Tabela de Documentos
                    db.run(`CREATE TABLE IF NOT EXISTS documents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        teacherId TEXT,
                        docType TEXT,
                        docLabel TEXT,
                        fileName TEXT,
                        fileType TEXT,
                        fileSize INTEGER,
                        filePath TEXT,
                        uploadedAt TEXT
                    )`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        });
    });
}

module.exports = {
    initDB,
    // Professores
    saveTeacher: (name) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO teachers (name, createdAt) VALUES (?, ?)`;
            db.run(sql, [name.toUpperCase(), new Date().toISOString()], function(err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) resolve({ error: "duplicate" });
                    else reject(err);
                } else resolve({ id: this.lastID, name: name.toUpperCase() });
            });
        });
    },

    getAllTeachers: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM teachers ORDER BY name ASC`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getTeacherById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM teachers WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    saveFicha: (ficha) => {
        return new Promise((resolve, reject) => {
            const { teacherId, data, status, submittedAt, updatedAt } = ficha;
            const sql = `INSERT OR REPLACE INTO fichas (teacherId, data, status, submittedAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [teacherId, JSON.stringify(data), status, submittedAt, updatedAt], function(err) {
                if (err) reject(err);
                else resolve({ teacherId, ...ficha });
            });
        });
    },

    getFicha: (teacherId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM fichas WHERE teacherId = ?`;
            db.get(sql, [teacherId], (err, row) => {
                if (err) reject(err);
                else {
                    if (row) row.data = JSON.parse(row.data);
                    resolve(row);
                }
            });
        });
    },

    getAllFichas: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM fichas`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else {
                    rows.forEach(r => r.data = JSON.parse(r.data));
                    resolve(rows);
                }
            });
        });
    },

    // Documentos
    saveDocument: (doc) => {
        return new Promise((resolve, reject) => {
            const { teacherId, docType, docLabel, fileName, fileType, fileSize, filePath, uploadedAt } = doc;
            const sql = `INSERT INTO documents (teacherId, docType, docLabel, fileName, fileType, fileSize, filePath, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [teacherId, docType, docLabel, fileName, fileType, fileSize, filePath, uploadedAt], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...doc });
            });
        });
    },

    getDocumentsByTeacher: (teacherId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM documents WHERE teacherId = ?`;
            db.all(sql, [teacherId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getAllDocuments: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM documents`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    deleteDocument: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM documents WHERE id = ?`;
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getDocumentById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM documents WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

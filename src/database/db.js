// src/database/db.js
const { Pool } = require('pg');

// Puxa a URL do banco que configuramos no .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Necessário para a maioria das hosts como ElephantSQL/Discloud
});

async function iniciarBanco() {
    try {
        // Criando a tabela de recrutamento se ela não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recrutamento (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                passaporte VARCHAR(50) NOT NULL,
                experiencia TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pendente',
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[BANCO] Tabela de recrutamento tá no esquema!');
    } catch (error) {
        console.error('[ERRO] Deu ruim ao conectar no PostgreSQL:', error);
    }
}

module.exports = { pool, iniciarBanco };
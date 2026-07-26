// src/database/db.js
const { Pool } = require('pg');

// Conexão com o PostgreSQL usando a URL do .env (Sem forçar SSL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Função que cria as tabelas assim que o bot liga
async function iniciarBanco() {
    try {
        // Tabela de Configurações da Facção (Multi-guild) com nome_faccao
        await pool.query(`
            CREATE TABLE IF NOT EXISTS server_config (
                guild_id VARCHAR(255) PRIMARY KEY,
                canal_rh_id VARCHAR(255),
                cargo_aprovado_id VARCHAR(255),
                nome_faccao VARCHAR(100) DEFAULT 'Nossa Facção'
            );
        `);

        // Tabela de Fichas de Recrutamento
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recrutamento (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                passaporte VARCHAR(50) NOT NULL,
                experiencia TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pendente',
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[BANCO] Estrutura multi-guild do Postgre tá armada com sucesso!');
    } catch (error) {
        console.error('[ERRO] Deu ruim ao conectar e criar as tabelas no PostgreSQL:', error);
    }
}

// Exportando a pool e a função pro index.js conseguir usar
module.exports = { pool, iniciarBanco };
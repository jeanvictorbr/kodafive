// src/database/db.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function iniciarBanco() {
    try {
        // 1. Tabela Principal de Configuração do Servidor
        await pool.query(`
            CREATE TABLE IF NOT EXISTS server_config (
                guild_id VARCHAR(255) PRIMARY KEY,
                canal_rh_id VARCHAR(255),
                cargo_aprovado_id VARCHAR(255)
            );
        `);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_vitrine_farm VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS msg_vitrine_farm VARCHAR(255);`);

        // Injeta as colunas novas de configuração com segurança (Migrations)
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS nome_faccao VARCHAR(100) DEFAULT 'Nossa Facção';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS cargo_recrutador_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_titulo VARCHAR(255) DEFAULT '📝 Recrutamento da Facção';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_desc TEXT DEFAULT 'Visão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho.';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_banner VARCHAR(255) DEFAULT 'https://i.ibb.co/68037k9/banner-placeholder.png';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_rodape VARCHAR(255) DEFAULT 'Sistema de Recrutamento';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_ponto_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS ciclo_farm VARCHAR(50) DEFAULT 'semanal';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_log_farm_id VARCHAR(255);`);
        
        // 🌟 ADDED: Colunas para o Sistema de Sincronia da Vitrine
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_vitrine_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS msg_vitrine_id VARCHAR(255);`);

        // 2. Sistema Avançado de Metas de Farm
        // 🚨 OS DROPS FORAM REMOVIDOS PARA NÃO ZERAR OS DADOS NO RESTART 🚨
        await pool.query(`
            CREATE TABLE IF NOT EXISTS meta_farm_config (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                item_nome VARCHAR(255) NOT NULL,
                meta_quantidade INT NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migrations do Farm
        await pool.query(`ALTER TABLE meta_farm_config ADD COLUMN IF NOT EXISTS ciclo VARCHAR(50) DEFAULT 'semanal';`);
        await pool.query(`ALTER TABLE meta_farm_config ADD COLUMN IF NOT EXISTS meta_atual INT DEFAULT 0;`); // 🌟 ADDED: Para guardar o progresso

        // Tabela de Entregas de Farm (Vinculada ao ID da meta)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS entregas_farm (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                meta_id INT REFERENCES meta_farm_config(id) ON DELETE CASCADE,
                quantidade INT NOT NULL,
                comprovante_url TEXT,
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`ALTER TABLE entregas_farm ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';`);

        // 3. Tabela do Relógio de Ponto
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bate_ponto (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                saida TIMESTAMP,
                status VARCHAR(50) DEFAULT 'aberto'
            );
        `);

        // 4. Tabela de Ranking dos Recrutadores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ranking_recrutadores (
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                pontos INT DEFAULT 0,
                PRIMARY KEY (guild_id, user_id)
            );
        `);

        // 5. Tabela do Cofre (Chaves VIP)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vip_keys (
                key VARCHAR(50) PRIMARY KEY,
                gerada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usada BOOLEAN DEFAULT false,
                usada_por VARCHAR(255),
                guild_id VARCHAR(255)
            );
        `);

        // 6. Tabela de Recrutamento e Fichas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recrutamento (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                passaporte VARCHAR(50) NOT NULL,
                experiencia TEXT NOT NULL
            );
        `);

        // Migrations de Fichas
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS nome_rp VARCHAR(100);`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS recrutador_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

        // 7. Perfil / XP dos Membros
        await pool.query(`
            CREATE TABLE IF NOT EXISTS membros (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                xp INT DEFAULT 0,
                nivel INT DEFAULT 1,
                data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, user_id)
            );
        `);

        // 8. Tribunal do Crime
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conduta (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                motivo TEXT NOT NULL,
                valor INT DEFAULT 0,
                duracao_horas INT DEFAULT 0,
                aplicado_por VARCHAR(255) NOT NULL,
                ativa BOOLEAN DEFAULT true,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_log_tribunal_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS cargo_tribunal_id VARCHAR(255);`);

        // 9. Tags Automáticas nos Apelidos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cargo_tags (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                cargo_id VARCHAR(255) NOT NULL,
                tag VARCHAR(100) NOT NULL,
                UNIQUE(guild_id, cargo_id)
            );
        `);

        console.log('[BANCO] Estrutura completa e atualizada com sucesso no PostgreSQL. NADA FOI ZERADO!');
    } catch (error) {
        console.error('[ERRO] Falha ao atualizar o PostgreSQL:', error);
    }
}

module.exports = { pool, iniciarBanco };
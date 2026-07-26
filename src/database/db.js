// src/database/db.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function iniciarBanco() {
    try {
        // Configuração da Meta de Farm da Facção
// Tabela de Metas Múltiplas com Ciclo de Tempo
        await pool.query(`
            CREATE TABLE IF NOT EXISTS meta_farm_config (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                item_nome VARCHAR(255) NOT NULL,
                meta_quantidade INT NOT NULL,
                ciclo VARCHAR(50) DEFAULT 'semanal', -- diario, semanal, mensal
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabela de Entregas (vinculada ao item da meta)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS entregas_farm (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                meta_id INT REFERENCES meta_farm_config(id) ON DELETE CASCADE,
                quantidade INT NOT NULL,
                comprovante_url TEXT, -- Link do print enviado pelo membro
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[BANCO] Sistema Avançado de Metas de Farm estruturado!');
        console.log('[BANCO] Sistema de Metas de Farm armado!');
        // Injeta a configuração do canal de Bate Ponto
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS canal_ponto_id VARCHAR(255);`);

        // Tabela do Relógio de Ponto
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
        console.log('[BANCO] Sistema de Bate Ponto armado!');
        // Tabela de Ranking dos Recrutadores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ranking_recrutadores (
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                pontos INT DEFAULT 0,
                PRIMARY KEY (guild_id, user_id)
            );
        `);
        // Injeta a coluna VIP nas configurações do servidor
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;`);

        // Tabela do cofre (Chaves VIP)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vip_keys (
                key VARCHAR(50) PRIMARY KEY,
                gerada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usada BOOLEAN DEFAULT false,
                usada_por VARCHAR(255),
                guild_id VARCHAR(255)
            );
        `);
        console.log('[BANCO] Sistema VIP e Chaves injetado com sucesso!');
        // 1. Cria a base se não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS server_config (
                guild_id VARCHAR(255) PRIMARY KEY,
                canal_rh_id VARCHAR(255),
                cargo_aprovado_id VARCHAR(255)
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recrutamento (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                passaporte VARCHAR(50) NOT NULL,
                experiencia TEXT NOT NULL
            );
        `);

        // 2. Injeta as colunas novas com segurança (Migrations)
        // Configurações da facção e painel customizável
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS nome_faccao VARCHAR(100) DEFAULT 'Nossa Facção';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS cargo_recrutador_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_titulo VARCHAR(255) DEFAULT '📝 Recrutamento da Facção';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_desc TEXT DEFAULT 'Visão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho.';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_banner VARCHAR(255) DEFAULT 'https://i.ibb.co/68037k9/banner-placeholder.png';`);
        await pool.query(`ALTER TABLE server_config ADD COLUMN IF NOT EXISTS painel_rodape VARCHAR(255) DEFAULT 'Sistema de Recrutamento';`);

        // Fichas de Recrutamento (Nome RP e Recrutador)
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS nome_rp VARCHAR(100);`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS recrutador_id VARCHAR(255);`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';`);
        await pool.query(`ALTER TABLE recrutamento ADD COLUMN IF NOT EXISTS data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

        console.log('[BANCO] Banco atualizado! Colunas de Recrutador e Painel injetadas.');
    } catch (error) {
        console.error('[ERRO] Falha ao atualizar o PostgreSQL:', error);
    }
}

module.exports = { pool, iniciarBanco };
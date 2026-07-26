// src/database/db.js (Atualização)
async function iniciarBanco() {
    try {
        // Tabela de Configurações por Servidor
        await pool.query(`
            CREATE TABLE IF NOT EXISTS server_config (
                guild_id VARCHAR(255) PRIMARY KEY,
                canal_rh_id VARCHAR(255)
            );
        `);

        // Tabela de Recrutamento (Agora atrelada ao servidor também)
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
        console.log('[BANCO] Estrutura multi-guild armada com sucesso!');
    } catch (error) {
        console.error('[ERRO] Deu ruim ao conectar no PostgreSQL:', error);
    }
}
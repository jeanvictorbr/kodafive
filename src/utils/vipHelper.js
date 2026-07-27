const { pool } = require('../database/db');

let cacheModoGratuito = null;
let cacheExpira = 0;

async function isModoGratuito() {
    if (Date.now() < cacheExpira) return cacheModoGratuito;
    const result = await pool.query("SELECT valor FROM global_config WHERE chave = 'modo_gratuito'");
    cacheModoGratuito = result.rows[0]?.valor === 'true';
    cacheExpira = Date.now() + 30000;
    return cacheModoGratuito;
}

async function vipLiberado(guildId) {
    if (await isModoGratuito()) return true;
    const result = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [guildId]);
    return result.rows[0]?.is_vip || false;
}

async function setModoGratuito(ativo) {
    await pool.query(
        "INSERT INTO global_config (chave, valor) VALUES ('modo_gratuito', $1) ON CONFLICT (chave) DO UPDATE SET valor = $1",
        [ativo ? 'true' : 'false']
    );
    cacheModoGratuito = ativo;
    cacheExpira = Date.now() + 30000;
}

module.exports = { isModoGratuito, vipLiberado, setModoGratuito };

const { pool } = require('../database/db');
const { isModoGratuito } = require('./vipHelper');

async function isVip(guildId) {
    if (await isModoGratuito()) return true;
    const result = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [guildId]);
    return result.rows[0]?.is_vip || false;
}

async function totalPorTipo(guildId, tipo, apenasAtivas = false) {
    let query = 'SELECT COUNT(*) as total FROM conduta WHERE guild_id = $1 AND tipo = $2';
    if (apenasAtivas) query += ' AND ativa = true';
    const result = await pool.query(query, [guildId, tipo]);
    return parseInt(result.rows[0].total);
}

module.exports = { isVip, totalPorTipo };

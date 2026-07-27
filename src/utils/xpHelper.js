const { pool } = require('../database/db');

const XP_POR_NIVEL = 100;
const COOLDOWN_XP = 45000;
const cooldowns = new Map();

function calcularNivel(xp) {
    return Math.floor(xp / XP_POR_NIVEL) + 1;
}

function xpParaProximoNivel(xp) {
    const nivelAtual = calcularNivel(xp);
    return (nivelAtual * XP_POR_NIVEL) - xp;
}

async function garantirMembro(guildId, userId) {
    await pool.query(`
        INSERT INTO membros (guild_id, user_id) VALUES ($1, $2)
        ON CONFLICT (guild_id, user_id) DO NOTHING
    `, [guildId, userId]);
}

async function adicionarXP(guildId, userId, quantidade) {
    await garantirMembro(guildId, userId);
    const result = await pool.query(`
        UPDATE membros SET xp = xp + $1 WHERE guild_id = $2 AND user_id = $3
        RETURNING xp
    `, [quantidade, guildId, userId]);

    const xpAtual = result.rows[0]?.xp || 0;
    const novoNivel = calcularNivel(xpAtual);

    await pool.query(
        'UPDATE membros SET nivel = $1 WHERE guild_id = $2 AND user_id = $3',
        [novoNivel, guildId, userId]
    );

    return { xp: xpAtual, nivel: novoNivel };
}

function podeGanharXP(guildId, userId) {
    const key = `${guildId}-${userId}`;
    const agora = Date.now();
    const ultimo = cooldowns.get(key);
    if (ultimo && (agora - ultimo) < COOLDOWN_XP) return false;
    cooldowns.set(key, agora);
    return true;
}

module.exports = { adicionarXP, podeGanharXP, calcularNivel, xpParaProximoNivel, garantirMembro };

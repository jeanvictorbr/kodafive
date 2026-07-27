const { pool } = require('../database/db');

async function verificarMetasBatidas(client, guildId) {
    const metas = await pool.query(`
        SELECT m.id, m.item_nome, m.meta_quantidade, m.meta_atual,
               COALESCE(SUM(e.quantidade), 0) as total_entregue
        FROM meta_farm_config m
        LEFT JOIN entregas_farm e ON e.meta_id = m.id AND e.status = 'validado'
        WHERE m.guild_id = $1
        GROUP BY m.id, m.item_nome, m.meta_quantidade, m.meta_atual
    `, [guildId]);

    for (const meta of metas.rows) {
        const totalEntregue = parseInt(meta.total_entregue);
        const metaAtual = parseInt(meta.meta_atual) || 0;

        if (totalEntregue >= meta.meta_quantidade && metaAtual < meta.meta_quantidade) {
            await pool.query(
                'UPDATE meta_farm_config SET meta_atual = $1 WHERE id = $2',
                [meta.meta_quantidade, meta.id]
            );

            const config = await pool.query('SELECT canal_log_farm_id, nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const nomeFac = config.rows[0]?.nome_faccao || 'Facção';

            if (config.rows[0]?.canal_log_farm_id) {
                const logChannel = client.channels.cache.get(config.rows[0].canal_log_farm_id);
                if (logChannel) {
                    await logChannel.send({
                        content: `🎉 **META ATINGIDA!**\n\n**Facção:** ${nomeFac}\n**Item:** ${meta.item_nome}\n**Total:** \`${totalEntregue.toLocaleString()}\` / \`${meta.meta_quantidade.toLocaleString()} un\`\n\nA tropa conseguiu bater a meta desse ciclo!`
                    });
                }
            }
        }
    }
}

module.exports = { verificarMetasBatidas };

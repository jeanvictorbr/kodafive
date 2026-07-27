const { pool } = require('../database/db');

function iniciarSchedulerVip(client) {
    // Verifica a cada 30 minutos
    setInterval(async () => {
        try {
            const expirados = await pool.query(
                "UPDATE server_config SET is_vip = false, vip_expira_em = NULL WHERE is_vip = true AND vip_expira_em IS NOT NULL AND vip_expira_em < NOW() RETURNING guild_id"
            );

            for (const row of expirados.rows) {
                const guild = client.guilds.cache.get(row.guild_id);
                if (guild) {
                    const logChannel = guild.channels.cache.find(c => c.name === 'koda-logs' || c.name === 'logs');
                    if (logChannel) {
                        await logChannel.send({ content: '⏰ **VIP expirado!** O plano Patrão deste servidor chegou ao fim.' }).catch(() => {});
                    }
                }
            }

            if (expirados.rows.length > 0) {
                console.log(`[VIP] ${expirados.rows.length} servidor(es) tiveram o VIP expirado.`);
            }
        } catch (error) {
            console.error('[VIP] Erro no scheduler de expiração:', error);
        }
    }, 1800000); // 30 minutos
}

module.exports = { iniciarSchedulerVip };

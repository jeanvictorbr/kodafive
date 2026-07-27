const { pool } = require('../database/db');
const { sendLogWebhook } = require('./webhookLogger');

function iniciarSchedulerVip(client) {
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

                await sendLogWebhook({
                    embeds: [{
                        color: 15548997,
                        title: '⏰ VIP EXPIRADO',
                        fields: [
                            { name: '🏠 Servidor', value: `\`${guild?.name || 'Desconhecido'}\` (\`${row.guild_id}\`)`, inline: false },
                            { name: '👥 Membros', value: `\`${guild?.memberCount || 0}\``, inline: true },
                            { name: '📅 Expirou em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        ],
                        footer: { text: `Guild ID: ${row.guild_id}` },
                        timestamp: new Date().toISOString()
                    }]
                });
            }

            if (expirados.rows.length > 0) {
                console.log(`[VIP] ${expirados.rows.length} servidor(es) tiveram o VIP expirado.`);
            }
        } catch (error) {
            console.error('[VIP] Erro no scheduler de expiração:', error);
        }
    }, 1800000);
}

module.exports = { iniciarSchedulerVip };

const { pool } = require('../database/db');
const { sendLogWebhook } = require('../utils/webhookLogger');

module.exports = async (client, guild) => {
    try {
        const totalGuilds = client.guilds.cache.size;

        let isVip = false;
        let vipExpira = null;
        try {
            const config = await pool.query('SELECT is_vip, vip_expira_em FROM server_config WHERE guild_id = $1', [guild.id]);
            if (config.rows[0]?.is_vip) {
                isVip = true;
                vipExpira = config.rows[0]?.vip_expira_em;
            }
        } catch {}

        await sendLogWebhook({
            embeds: [{
                color: 15548997,
                title: '❌ BOT REMOVIDO DO SERVIDOR',
                thumbnail: { url: guild.iconURL({ size: 256 }) || '' },
                fields: [
                    { name: '🏠 Servidor', value: `\`${guild.name}\` (\`${guild.id}\`)`, inline: false },
                    { name: '👥 Membros', value: `\`${guild.memberCount}\``, inline: true },
                    { name: '💎 VIP', value: isVip ? `✅ Ativo${vipExpira ? ` (expira <t:${Math.floor(new Date(vipExpira).getTime() / 1000)}:R>)` : ' (vitalício)'}` : '❌ Não', inline: true },
                    { name: '🌐 Total de Servidores', value: `\`${totalGuilds}\``, inline: true }
                ],
                footer: { text: `ID: ${guild.id}` },
                timestamp: new Date().toISOString()
            }]
        });
    } catch (error) {
        console.error('[GUILD DELETE] Erro ao logar:', error);
    }
};

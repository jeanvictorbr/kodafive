const { sendLogWebhook } = require('../utils/webhookLogger');

module.exports = async (client, guild) => {
    try {
        await guild.fetch();
        const owner = await guild.fetchOwner().catch(() => null);
        const totalGuilds = client.guilds.cache.size;

        await sendLogWebhook({
            embeds: [{
                color: 4437377,
                title: '✅ BOT ADICIONADO AO SERVIDOR',
                thumbnail: { url: guild.iconURL({ size: 256 }) || '' },
                fields: [
                    { name: '🏠 Servidor', value: `\`${guild.name}\` (\`${guild.id}\`)`, inline: false },
                    { name: '👑 Dono', value: owner ? `\`${owner.user.tag}\` (\`${owner.id}\`)` : '`Desconhecido`', inline: true },
                    { name: '👥 Membros', value: `\`${guild.memberCount}\``, inline: true },
                    { name: '💬 Canais', value: `\`${guild.channels.cache.size}\``, inline: true },
                    { name: '🌐 Total de Servidores', value: `\`${totalGuilds}\``, inline: true },
                    { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true }
                ],
                footer: { text: `ID: ${guild.id}` },
                timestamp: new Date().toISOString()
            }]
        });
    } catch (error) {
        console.error('[GUILD CREATE] Erro ao logar:', error);
    }
};

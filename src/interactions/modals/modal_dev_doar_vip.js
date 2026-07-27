const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');
const { sendLogWebhook } = require('../../utils/webhookLogger');

module.exports = {
    customId: 'modal_dev_doar_vip',
    async execute(client, interaction) {
        const guildId = interaction.fields.getTextInputValue('input_guild_id').trim();
        const dias = parseInt(interaction.fields.getTextInputValue('input_dias'));
        const motivo = interaction.fields.getTextInputValue('input_motivo').trim() || '—';

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return interaction.reply({ content: `❌ Servidor não encontrado. O bot não está em \`${guildId}\`.`, flags: 64 });
        }

        if (isNaN(dias) || dias < 0) {
            return interaction.reply({ content: '❌ Dias inválido (0 = vitalício, >0 = dias).', flags: 64 });
        }

        let expiraEm = null;
        let duracaoTexto = '';
        if (dias > 0) {
            expiraEm = new Date(Date.now() + dias * 86400000);
            duracaoTexto = `\n📅 **Expira em:** <t:${Math.floor(expiraEm.getTime() / 1000)}:R>`;
        } else {
            duracaoTexto = '\n♾️ **Duração:** Vitalícia';
        }

        await pool.query(
            `UPDATE server_config SET is_vip = true, vip_expira_em = $1, vip_origem = $2, vip_doado_por = $3, vip_doado_em = NOW() WHERE guild_id = $4`,
            [expiraEm, 'doacao', interaction.user.id, guildId]
        );

        await interaction.reply({
            content: `🎁 **VIP doado com sucesso para \`${guild.name}\`!**${duracaoTexto}\n📝 Motivo: ${motivo}`,
            flags: 64
        });

        await sendLogWebhook({
            embeds: [{
                color: 15844367,
                title: '🎁 VIP DOADO',
                fields: [
                    { name: '🏠 Servidor', value: `\`${guild.name}\` (\`${guildId}\`)`, inline: false },
                    { name: '👤 Doado por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: true },
                    { name: '⏳ Duração', value: dias > 0 ? `\`${dias} dias\` (expira <t:${Math.floor(expiraEm.getTime() / 1000)}:R>)` : '`Vitalícia`', inline: true },
                    { name: '📝 Motivo', value: `\`\`\`${motivo}\`\`\``, inline: false },
                    { name: '👥 Membros', value: `\`${guild.memberCount}\``, inline: true }
                ],
                footer: { text: `Guild ID: ${guildId} • Doado por: ${interaction.user.id}` },
                timestamp: new Date().toISOString()
            }]
        });
    }
};

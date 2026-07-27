const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');
const { sendLogWebhook } = require('../../utils/webhookLogger');

module.exports = {
    customId: 'btn_dev_confirm',
    async execute(client, interaction) {
        const action = interaction.customId.replace('btn_dev_confirm_', '');
        if (!action) return;

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 6 }
        });

        if (action === 'all_grant') {
            const guilds = client.guilds.cache;
            let count = 0;
            for (const [id] of guilds) {
                await pool.query(
                    "INSERT INTO server_config (guild_id, is_vip, vip_origem) VALUES ($1, true, 'manual') ON CONFLICT (guild_id) DO UPDATE SET is_vip = true, vip_origem = 'manual'",
                    [id]
                ).catch(() => {});
                count++;
            }

            await sendLogWebhook({
                embeds: [{
                    color: 5763719,
                    title: '💎 VIP CONCEDIDO A TODOS (Dev Panel)',
                    fields: [
                        { name: '👤 Por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: false },
                        { name: '🌐 Servidores', value: `\`${count}\``, inline: true }
                    ],
                    footer: { text: `User ID: ${interaction.user.id}` },
                    timestamp: new Date().toISOString()
                }]
            });
        } else if (action === 'all_revoke') {
            const result = await pool.query("UPDATE server_config SET is_vip = false, vip_expira_em = NULL, vip_origem = 'key' WHERE is_vip = true RETURNING guild_id");
            const count = result.rowCount || 0;

            await sendLogWebhook({
                embeds: [{
                    color: 15548997,
                    title: '⛔ VIP REMOVIDO DE TODOS (Dev Panel)',
                    fields: [
                        { name: '👤 Por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: false },
                        { name: '🌐 Servidores', value: `\`${count}\``, inline: true }
                    ],
                    footer: { text: `User ID: ${interaction.user.id}` },
                    timestamp: new Date().toISOString()
                }]
            });
        } else if (action === 'remover_doados') {
            const result = await pool.query(
                "UPDATE server_config SET is_vip = false, vip_expira_em = NULL, vip_origem = 'key', vip_doado_por = NULL, vip_doado_em = NULL WHERE vip_origem = 'doacao' RETURNING guild_id"
            );
            const count = result.rowCount || 0;

            const guildNames = [];
            for (const row of result.rows) {
                const g = client.guilds.cache.get(row.guild_id);
                if (g) guildNames.push(g.name);
            }

            await sendLogWebhook({
                embeds: [{
                    color: 15844367,
                    title: '🎁 VIPs DOADOS REMOVIDOS',
                    fields: [
                        { name: '👤 Por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: false },
                        { name: '🌐 Servidores afetados', value: `\`${count}\``, inline: true },
                        { name: '📋 Lista', value: guildNames.length > 0 ? `\`\`\`${guildNames.join('\n')}\`\`\`` : 'Nenhum', inline: false }
                    ],
                    footer: { text: `User ID: ${interaction.user.id}` },
                    timestamp: new Date().toISOString()
                }]
            });
        }

        const painel = await buildPainelDev(client, 1);
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );
    }
};

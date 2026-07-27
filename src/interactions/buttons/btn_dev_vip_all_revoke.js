const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_vip_all_revoke',
    async execute(client, interaction) {
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 6 }
        });

        await pool.query('UPDATE server_config SET is_vip = false WHERE is_vip = true');

        const painel = await buildPainelDev(client);
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );

        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: '⛔ VIP removido de **todos** os servidores!', flags: 64 } }
        ).catch(() => {});
    }
};

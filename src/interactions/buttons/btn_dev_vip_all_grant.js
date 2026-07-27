const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_vip_all_grant',
    async execute(client, interaction) {
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 6 }
        });

        const guilds = client.guilds.cache;
        for (const [id] of guilds) {
            await pool.query(
                'INSERT INTO server_config (guild_id, is_vip) VALUES ($1, true) ON CONFLICT (guild_id) DO UPDATE SET is_vip = true',
                [id]
            ).catch(() => {});
        }

        const painel = await buildPainelDev(client);
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );

        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `✅ VIP concedido a **${guilds.size}** servidores!`, flags: 64 } }
        ).catch(() => {});
    }
};

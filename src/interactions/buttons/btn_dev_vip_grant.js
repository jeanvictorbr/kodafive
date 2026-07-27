const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_vip_grant',
    async execute(client, interaction) {
        const guildId = interaction.customId.replace('btn_dev_vip_grant_', '');
        if (!guildId) return;

        await pool.query(
            'INSERT INTO server_config (guild_id, is_vip) VALUES ($1, true) ON CONFLICT (guild_id) DO UPDATE SET is_vip = true',
            [guildId]
        );

        const painel = await buildPainelDev(client, 1, guildId);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

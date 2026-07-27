const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'config_select_canal_log_farm',
    async execute(client, interaction) {
        await pool.query(
            `INSERT INTO server_config (guild_id, canal_log_farm_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_log_farm_id = $2`,
            [interaction.guildId, interaction.values[0]]
        );

        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });
    }
};

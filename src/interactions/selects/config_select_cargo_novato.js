const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelRH } = require('../../utils/buildPainelRH');

module.exports = {
    customId: 'config_select_cargo_novato',
    async execute(client, interaction) {
        await pool.query(
            `INSERT INTO server_config (guild_id, cargo_aprovado_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET cargo_aprovado_id = $2`, 
            [interaction.guildId, interaction.values[0]]
        );
        const subModuloRH = await buildPainelRH(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: subModuloRH } }
        });
    }
};
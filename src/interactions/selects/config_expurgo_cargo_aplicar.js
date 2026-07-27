const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelExpurgo } = require('../../utils/buildPainelExpurgo');

module.exports = {
    customId: 'config_expurgo_cargo_aplicar',
    async execute(client, interaction) {
        await pool.query(
            `INSERT INTO config_expurgo (guild_id, cargo_aplicar_id) VALUES ($1, $2)
             ON CONFLICT (guild_id) DO UPDATE SET cargo_aplicar_id = $2`,
            [interaction.guildId, interaction.values[0]]
        );
        const painel = await buildPainelExpurgo(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

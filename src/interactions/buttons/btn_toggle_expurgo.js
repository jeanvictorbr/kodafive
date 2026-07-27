const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelExpurgo } = require('../../utils/buildPainelExpurgo');

module.exports = {
    customId: 'btn_toggle_expurgo',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT ativo FROM config_expurgo WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || { ativo: false };

        const novoStatus = !config.ativo;

        await pool.query(
            `INSERT INTO config_expurgo (guild_id, ativo) VALUES ($1, $2)
             ON CONFLICT (guild_id) DO UPDATE SET ativo = $2`,
            [interaction.guildId, novoStatus]
        );

        const painel = await buildPainelExpurgo(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

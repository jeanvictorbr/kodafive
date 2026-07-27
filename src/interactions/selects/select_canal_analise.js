const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelSugestoes } = require('../../utils/buildPainelSugestoes');

module.exports = {
    customId: 'select_canal_analise',
    async execute(client, interaction) {
        const channelId = interaction.values[0];

        await pool.query(
            `INSERT INTO config_sugestao (guild_id, canal_analise_id) VALUES ($1, $2)
             ON CONFLICT (guild_id) DO UPDATE SET canal_analise_id = $2`,
            [interaction.guildId, channelId]
        );

        const painel = await buildPainelSugestoes(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

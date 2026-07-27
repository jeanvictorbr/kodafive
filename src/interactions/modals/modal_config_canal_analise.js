const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelSugestoes } = require('../../utils/buildPainelSugestoes');

module.exports = {
    customId: 'modal_config_canal_analise',
    async execute(client, interaction) {
        const channelId = interaction.fields.getTextInputValue('input_channel_id').trim();

        if (!interaction.guild.channels.cache.has(channelId)) {
            return interaction.reply({ content: '❌ Canal não encontrado neste servidor.', flags: 64 });
        }

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

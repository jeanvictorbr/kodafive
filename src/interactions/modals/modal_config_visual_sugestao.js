const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelSugestoes } = require('../../utils/buildPainelSugestoes');

module.exports = {
    customId: 'modal_config_visual_sugestao',
    async execute(client, interaction) {
        const bannerUrl = interaction.fields.getTextInputValue('input_banner').trim();
        const descricao = interaction.fields.getTextInputValue('input_descricao').trim();

        await pool.query(
            `INSERT INTO config_sugestao (guild_id, banner_url, descricao) VALUES ($1, $2, $3)
             ON CONFLICT (guild_id) DO UPDATE SET banner_url = $2, descricao = $3`,
            [interaction.guildId, bannerUrl, descricao]
        );

        const painel = await buildPainelSugestoes(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

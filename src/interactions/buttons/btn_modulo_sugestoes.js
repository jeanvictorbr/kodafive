const { Routes } = require('discord.js');
const { buildPainelSugestoes } = require('../../utils/buildPainelSugestoes');

module.exports = {
    customId: 'btn_modulo_sugestoes',
    async execute(client, interaction) {
        const painel = await buildPainelSugestoes(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

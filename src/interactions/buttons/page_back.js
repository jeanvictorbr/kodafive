const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    customId: 'page_back',
    async execute(client, interaction) {
        const painel = await buildPainelQG(interaction, 1);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

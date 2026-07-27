const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    customId: 'page_next',
    async execute(client, interaction) {
        const painel = await buildPainelQG(interaction, 2);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

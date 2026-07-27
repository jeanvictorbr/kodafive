const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    customId: 'page_next',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const painel = await buildPainelQG(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

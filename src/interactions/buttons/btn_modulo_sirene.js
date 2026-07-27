const { Routes } = require('discord.js');
const { buildPainelSirene } = require('../../utils/buildPainelSirene');

module.exports = {
    customId: 'btn_modulo_sirene',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const painel = await buildPainelSirene(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

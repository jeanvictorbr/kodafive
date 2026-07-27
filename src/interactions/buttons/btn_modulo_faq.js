const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');

module.exports = {
    customId: 'btn_modulo_faq',
    async execute(client, interaction) {
        const painel = await buildPainelFAQ(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

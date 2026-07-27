const { Routes } = require('discord.js');
const { buildPainelXP } = require('../../utils/buildPainelXP');

module.exports = {
    customId: 'btn_submodulo_xp',
    async execute(client, interaction) {
        const painel = await buildPainelXP(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

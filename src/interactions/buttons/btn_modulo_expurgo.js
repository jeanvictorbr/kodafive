const { Routes } = require('discord.js');
const { buildPainelExpurgo } = require('../../utils/buildPainelExpurgo');

module.exports = {
    customId: 'btn_modulo_expurgo',
    async execute(client, interaction) {
        const painel = await buildPainelExpurgo(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

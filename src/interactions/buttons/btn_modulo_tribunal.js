const { Routes } = require('discord.js');
const { buildPainelTribunal } = require('../../utils/buildPainelTribunal');

module.exports = {
    customId: 'btn_modulo_tribunal',
    async execute(client, interaction) {
        const painel = await buildPainelTribunal(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

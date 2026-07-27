const { Routes } = require('discord.js');
const { buildPainelAliancasAdmin } = require('../../utils/buildPainelAliancasAdmin');

module.exports = {
    customId: 'btn_modulo_aliancas',
    async execute(client, interaction) {
        const painel = await buildPainelAliancasAdmin(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

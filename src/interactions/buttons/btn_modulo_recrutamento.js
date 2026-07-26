const { Routes } = require('discord.js');
const { buildPainelRH } = require('../../utils/buildPainelRH');

module.exports = {
    customId: 'btn_modulo_recrutamento',
    async execute(client, interaction) {
        const subModuloRH = await buildPainelRH(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: subModuloRH } }
        });
    }
};
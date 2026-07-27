const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'btn_cancelar_reset_farm',
    async execute(client, interaction) {
        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });
    }
};

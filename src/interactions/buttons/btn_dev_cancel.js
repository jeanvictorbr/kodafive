const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_cancel',
    async execute(client, interaction) {
        const painel = await buildPainelDev(client, 1);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

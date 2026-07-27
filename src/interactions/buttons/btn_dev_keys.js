const { Routes } = require('discord.js');
const { buildPainelDevKeys } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_keys',
    async execute(client, interaction) {
        const painel = await buildPainelDevKeys(client);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

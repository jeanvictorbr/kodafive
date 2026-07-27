const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'select_dev_server',
    async execute(client, interaction) {
        const guildId = interaction.values[0];
        const painel = await buildPainelDev(client, 1, guildId);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

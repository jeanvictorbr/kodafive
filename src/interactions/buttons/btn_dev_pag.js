const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_pag',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.split('_').pop()) || 1;
        const painel = await buildPainelDev(client, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

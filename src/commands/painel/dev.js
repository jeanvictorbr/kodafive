const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    name: 'dev',
    description: '[DEV] Central de Controle do Bot',
    async execute(interaction) {
        if (interaction.user.id !== process.env.DEV_ID) {
            return interaction.reply({ content: '❌ Apenas o desenvolvedor do bot pode usar este comando.', flags: 64 });
        }
        const client = interaction.client;
        const painel = await buildPainelDev(client);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 4, data: { flags: 32832, components: painel } }
        });
    }
};

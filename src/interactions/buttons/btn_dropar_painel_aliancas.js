const { Routes } = require('discord.js');
const { buildPainelAliancasPublico } = require('../../utils/buildPainelAliancasPublico');

module.exports = {
    customId: 'btn_dropar_painel_aliancas',
    async execute(client, interaction) {
        try {
            const painel = await buildPainelAliancasPublico(interaction);
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painel }
            });
            await interaction.reply({ content: '✅ Painel de relações dropado no canal!', flags: 64 });
        } catch (error) {
            console.error('[ALIANCAS] Erro ao dropar painel:', error);
            await interaction.reply({ content: '❌ Erro ao dropar painel.', flags: 64 });
        }
    }
};

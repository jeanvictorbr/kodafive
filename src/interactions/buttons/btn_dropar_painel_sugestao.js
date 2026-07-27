const { Routes } = require('discord.js');
const { buildPainelPublicoSugestoes } = require('../../utils/buildPainelPublicoSugestoes');

module.exports = {
    customId: 'btn_dropar_painel_sugestao',
    async execute(client, interaction) {
        try {
            const painel = await buildPainelPublicoSugestoes(interaction);
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { components: painel }
            });
            await interaction.reply({ content: '✅ Painel de sugestões dropado no canal!', flags: 64 });
        } catch (error) {
            console.error('[SUGESTAO] Erro ao dropar painel:', error);
            await interaction.reply({ content: '❌ Erro ao dropar painel.', flags: 64 });
        }
    }
};

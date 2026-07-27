const { Routes } = require('discord.js');
const { buildPainelPublicoSugestoes } = require('../../utils/buildPainelPublicoSugestoes');

module.exports = {
    customId: 'btn_dropar_painel_sugestao',
    async execute(client, interaction) {
        try {
            const painel = await buildPainelPublicoSugestoes(interaction);

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 4, data: { components: painel } }
            });

            // Follow-up efêmero de confirmação
            await client.rest.post(
                `/webhooks/${interaction.applicationId}/${interaction.token}`,
                { body: { content: '✅ Painel de sugestões dropado no canal!', flags: 64 } }
            ).catch(() => {});
        } catch (error) {
            console.error('[SUGESTAO] Erro ao dropar painel:', error);
        }
    }
};

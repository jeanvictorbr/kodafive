const { Routes } = require('discord.js');
const { buildPainelPublicoSugestoes } = require('../../utils/buildPainelPublicoSugestoes');

module.exports = {
    customId: 'btn_dropar_painel_sugestao',
    async execute(client, interaction) {
        try {
            const painel = await buildPainelPublicoSugestoes(interaction);

            // Defer primeiro pra depois editar com V2 (única forma de mandar V2 pra canal normal)
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 5 } // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
            });

            await client.rest.patch(
                `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
                { body: { components: painel } }
            );
        } catch (error) {
            console.error('[SUGESTAO] Erro ao dropar painel:', error);
        }
    }
};

const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    customId: 'btn_voltar_menu_principal',
    async execute(client, interaction) {
        try {
            const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
            const payloadOriginal = await buildPainelQG(interaction, pagina);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadOriginal } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao voltar menu principal:', error);
        }
    }
};

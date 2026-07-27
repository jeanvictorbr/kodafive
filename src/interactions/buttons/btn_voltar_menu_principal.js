// src/interactions/buttons/btn_voltar_menu_principal.js
const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    customId: 'btn_voltar_menu_principal',
    async execute(client, interaction) {
        try {
            const payloadOriginal = await buildPainelQG(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadOriginal } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao voltar menu principal:', error);
        }
    }
};
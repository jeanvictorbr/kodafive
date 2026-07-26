// src/interactions/buttons/btn_submodulo_farm.js
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'btn_submodulo_farm',
    async execute(client, interaction) {
        try {
            const painelFarm = await buildPainelFarm(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painelFarm } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir dashboard de farm:', error);
        }
    }
};
// src/interactions/buttons/btn_submodulo_rec.js
const { Routes } = require('discord.js');
const { buildPainelRH } = require('../../utils/buildPainelRH');

module.exports = {
    customId: 'btn_submodulo_rec',
    async execute(client, interaction) {
        try {
            const subModuloRH = await buildPainelRH(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: subModuloRH } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir dashboard do RH:', error);
        }
    }
};
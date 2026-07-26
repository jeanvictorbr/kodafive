const { Routes } = require('discord.js');
const { buildPainelPonto } = require('../../utils/buildPainelPonto');

module.exports = {
    customId: 'btn_submodulo_ponto',
    async execute(client, interaction) {
        try {
            const painelPonto = await buildPainelPonto(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painelPonto } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir dashboard do Ponto:', error);
        }
    }
};
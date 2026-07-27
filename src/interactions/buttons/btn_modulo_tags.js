const { Routes } = require('discord.js');
const { buildPainelTags } = require('../../utils/buildPainelTags');

module.exports = {
    customId: 'btn_modulo_tags',
    async execute(client, interaction) {
        try {
            const painel = await buildPainelTags(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir painel de tags:', error);
        }
    }
};

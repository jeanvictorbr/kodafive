const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelTags } = require('../../utils/buildPainelTags');

module.exports = {
    customId: 'btn_modulo_tags',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        try {
            const painel = await buildPainelTags(interaction, pagina);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir painel de tags:', error);
        }
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFaq } = require('../../utils/buildPainelFaq');
const { vipLiberado } = require('../../utils/vipHelper');

module.exports = {
    customId: 'btn_modulo_faq',
    async execute(client, interaction) {
        if (!await vipLiberado(interaction.guildId)) {
            return interaction.reply({ content: '❌ Este módulo é exclusivo para servidores **VIP**. Resgate uma chave no QG.', flags: 64 });
        }
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const painel = await buildPainelFAQ(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');
const { vipLiberado } = require('../../utils/vipHelper');

module.exports = {
    customId: 'btn_modulo_faq',
    async execute(client, interaction) {
        if (!await vipLiberado(interaction.guildId)) {
            return interaction.reply({ content: '❌ Este módulo é exclusivo para servidores **VIP**. Resgate uma chave no QG.', flags: 64 });
        }
        try {
            const painel = await buildPainelFAQ(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir painel FAQ:', error);
        }
    }
};

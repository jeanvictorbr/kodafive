const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');

module.exports = {
    customId: 'btn_modulo_faq',
    async execute(client, interaction) {
        const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        if (!config.rows[0]?.is_vip) {
            return interaction.reply({ content: '❌ Este módulo é exclusivo para servidores **VIP**. Resgate uma chave no QG.', flags: 64 });
        }
        const painel = await buildPainelFAQ(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

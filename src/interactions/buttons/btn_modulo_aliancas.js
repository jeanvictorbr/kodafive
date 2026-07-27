const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelAliancasAdmin } = require('../../utils/buildPainelAliancasAdmin');

module.exports = {
    customId: 'btn_modulo_aliancas',
    async execute(client, interaction) {
        const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        if (!config.rows[0]?.is_vip) {
            return interaction.reply({ content: '❌ Este módulo é exclusivo para servidores **VIP**. Resgate uma chave no QG.', flags: 64 });
        }
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const painel = await buildPainelAliancasAdmin(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

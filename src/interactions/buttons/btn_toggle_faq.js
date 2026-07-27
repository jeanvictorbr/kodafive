const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');

module.exports = {
    customId: 'btn_toggle_faq',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT faq_ativo FROM server_config WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || { faq_ativo: true };

        const novoStatus = config.faq_ativo !== true;

        await pool.query(
            'UPDATE server_config SET faq_ativo = $1 WHERE guild_id = $2',
            [novoStatus, interaction.guildId]
        );

        const painel = await buildPainelFAQ(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

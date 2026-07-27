const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');

module.exports = {
    customId: 'select_del_resposta',
    async execute(client, interaction) {
        const id = parseInt(interaction.values[0]);
        await pool.query('DELETE FROM auto_resposta WHERE id = $1 AND guild_id = $2', [id, interaction.guildId]);
        const painel = await buildPainelFAQ(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelAliancasAdmin } = require('../../utils/buildPainelAliancasAdmin');

module.exports = {
    customId: 'select_del_alianca',
    async execute(client, interaction) {
        const id = parseInt(interaction.values[0]);
        await pool.query('DELETE FROM aliancas WHERE id = $1 AND guild_id = $2', [id, interaction.guildId]);
        const painel = await buildPainelAliancasAdmin(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

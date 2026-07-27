const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');

module.exports = {
    customId: 'config_select_canal_plantao',
    async execute(client, interaction) {
        await pool.query(
            'UPDATE server_config SET canal_plantao_id = $1 WHERE guild_id = $2',
            [interaction.values[0], interaction.guildId]
        );

        const painel = await buildPainelPlantao(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPonto } = require('../../utils/buildPainelPonto');

module.exports = {
    customId: 'config_select_canal_ponto',
    async execute(client, interaction) {
        await pool.query(
            `INSERT INTO server_config (guild_id, canal_ponto_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_ponto_id = $2`, 
            [interaction.guildId, interaction.values[0]]
        );
        
        // Atualiza a Interface do Ponto Imediatamente
        const painelPonto = await buildPainelPonto(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelPonto } }
        });
    }
};
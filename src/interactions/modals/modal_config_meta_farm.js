// src/interactions/modals/modal_config_meta_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'modal_config_meta_farm',
    async execute(client, interaction) {
        const itemNome = interaction.fields.getTextInputValue('input_item_nome');
        const metaQtd = parseInt(interaction.fields.getTextInputValue('input_meta_qtd')) || 1000;

        await pool.query(`
            INSERT INTO meta_farm_config (guild_id, item_nome, meta_quantidade) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (guild_id) 
            DO UPDATE SET item_nome = $2, meta_quantidade = $3
        `, [interaction.guildId, itemNome, metaQtd]);

        // Atualiza a interface instantaneamente
        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });
    }
};
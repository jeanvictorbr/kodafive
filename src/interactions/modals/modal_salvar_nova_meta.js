// src/interactions/modals/modal_salvar_nova_meta.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'modal_salvar_nova_meta',
    async execute(client, interaction) {
        const item = interaction.fields.getTextInputValue('input_item');
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd')) || 100;
        const ciclo = interaction.fields.getTextInputValue('input_ciclo').toLowerCase().trim();

        const cicloValido = ['diario', 'semanal', 'mensal'].includes(ciclo) ? ciclo : 'semanal';

        await pool.query(
            "INSERT INTO meta_farm_config (guild_id, item_nome, meta_quantidade, ciclo) VALUES ($1, $2, $3, $4)",
            [interaction.guildId, item, qtd, cicloValido]
        );

        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });
    }
};
// src/interactions/modals/modal_salvar_nova_meta.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm'); // Adiciona o Import

module.exports = {
    customId: 'modal_salvar_nova_meta',
    async execute(client, interaction) {
        const item = interaction.fields.getTextInputValue('input_item');
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd')) || 100;

        await pool.query(
            "INSERT INTO meta_farm_config (guild_id, item_nome, meta_quantidade) VALUES ($1, $2, $3)",
            [interaction.guildId, item, qtd]
        );

        // Atualiza a tela do Gestor
        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });

        // Dispara o gatilho para a vitrine pública atualizar na hora
        await atualizarVitrineFarm(client, interaction.guildId);
    }
};
// src/interactions/modals/modal_salvar_ciclo_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'modal_salvar_ciclo_farm',
    async execute(client, interaction) {
        const novoCiclo = interaction.fields.getTextInputValue('input_novo_ciclo').toLowerCase().trim();
        const cicloValido = ['diario', 'semanal', 'mensal'].includes(novoCiclo) ? novoCiclo : 'semanal';

        await pool.query(
            "UPDATE server_config SET ciclo_farm = $1 WHERE guild_id = $2",
            [cicloValido, interaction.guildId]
        );

        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });
    }
};
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelExpurgo } = require('../../utils/buildPainelExpurgo');

module.exports = {
    customId: 'modal_config_expurgo',
    async execute(client, interaction) {
        const diasPonto = parseInt(interaction.fields.getTextInputValue('input_dias_ponto'));
        const diasFarm = parseInt(interaction.fields.getTextInputValue('input_dias_farm'));
        const aviso = parseInt(interaction.fields.getTextInputValue('input_aviso'));

        if (isNaN(diasPonto) || isNaN(diasFarm) || isNaN(aviso) || diasPonto < 1 || diasFarm < 1 || aviso < 0) {
            return interaction.reply({ content: '❌ Valores inválidos.', flags: 64 });
        }

        try {
            await pool.query(
                `INSERT INTO config_expurgo (guild_id, dias_sem_ponto, dias_sem_farm, aviso_dias) VALUES ($1, $2, $3, $4)
                 ON CONFLICT (guild_id) DO UPDATE SET dias_sem_ponto = $2, dias_sem_farm = $3, aviso_dias = $4`,
                [interaction.guildId, diasPonto, diasFarm, aviso]
            );

            const painel = await buildPainelExpurgo(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[EXPURGO] Erro:', error);
            await interaction.reply({ content: '❌ Erro ao salvar.', flags: 64 });
        }
    }
};

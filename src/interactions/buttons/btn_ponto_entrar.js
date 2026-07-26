// src/interactions/buttons/btn_ponto_entrar.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_ponto_entrar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        try {
            // Verifica se já tem um ponto aberto
            const aberto = await pool.query(
                "SELECT id FROM bate_ponto WHERE guild_id = $1 AND user_id = $2 AND status = 'aberto'", 
                [guildId, userId]
            );

            if (aberto.rows.length > 0) {
                return interaction.reply({ content: '⚠️ Você **já está em serviço**, cria! Finaliza o turno atual antes de iniciar outro.', flags: 64 });
            }

            // Registra a entrada
            await pool.query(
                "INSERT INTO bate_ponto (guild_id, user_id, status) VALUES ($1, $2, 'aberto')", 
                [guildId, userId]
            );

            await interaction.reply({ content: '🟢 **Serviço iniciado com sucesso!** Bom plantão, foco no corre.', flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao iniciar ponto:', error);
            await interaction.reply({ content: 'Deu ruim ao registrar sua entrada.', flags: 64 });
        }
    }
};
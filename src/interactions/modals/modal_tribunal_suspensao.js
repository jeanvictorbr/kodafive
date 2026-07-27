const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_tribunal_suspensao',
    async execute(client, interaction) {
        const userId = interaction.fields.getTextInputValue('input_user_id').trim();
        const duracao = parseInt(interaction.fields.getTextInputValue('input_duracao'));
        const motivo = interaction.fields.getTextInputValue('input_motivo').trim();

        if (!userId || isNaN(duracao) || duracao <= 0 || !motivo) {
            return interaction.reply({ content: '❌ Dados inválidos. Verifique o ID, duração e motivo.', flags: 64 });
        }

        try {
            await pool.query(
                "INSERT INTO conduta (guild_id, user_id, tipo, motivo, duracao_horas, aplicado_por) VALUES ($1, $2, 'suspensao', $3, $4, $5)",
                [interaction.guildId, userId, motivo, duracao, interaction.user.id]
            );

            const expiraEm = new Date(Date.now() + duracao * 3600000);

            await interaction.reply({
                content: `🔒 **Suspensão aplicada!**\n\n**Membro:** <@${userId}>\n**Duração:** \`${duracao}h\`\n**Expira em:** <t:${Math.floor(expiraEm.getTime() / 1000)}:F>\n**Motivo:** ${motivo}\n**Aplicado por:** <@${interaction.user.id}>`,
                flags: 64
            });

        } catch (error) {
            console.error('[ERRO] Falha ao suspender membro:', error);
            await interaction.reply({ content: 'Erro ao aplicar suspensão.', flags: 64 });
        }
    }
};

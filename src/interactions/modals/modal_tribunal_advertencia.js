const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_tribunal_advertencia',
    async execute(client, interaction) {
        const userId = interaction.fields.getTextInputValue('input_user_id').trim();
        const motivo = interaction.fields.getTextInputValue('input_motivo').trim();

        if (!userId || !motivo) {
            return interaction.reply({ content: '❌ Preencha o ID do membro e o motivo.', flags: 64 });
        }

        try {
            await pool.query(
                "INSERT INTO conduta (guild_id, user_id, tipo, motivo, aplicado_por) VALUES ($1, $2, 'advertencia', $3, $4)",
                [interaction.guildId, userId, motivo, interaction.user.id]
            );

            await interaction.reply({
                content: `📋 **Advertência registrada!**\n\n**Membro:** <@${userId}>\n**Motivo:** ${motivo}\n**Aplicado por:** <@${interaction.user.id}>`,
                flags: 64
            });

        } catch (error) {
            console.error('[ERRO] Falha ao registrar advertência:', error);
            await interaction.reply({ content: 'Erro ao registrar advertência.', flags: 64 });
        }
    }
};

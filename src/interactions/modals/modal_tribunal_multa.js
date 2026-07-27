const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_tribunal_multa',
    async execute(client, interaction) {
        const userId = interaction.fields.getTextInputValue('input_user_id').trim();
        const valor = parseInt(interaction.fields.getTextInputValue('input_valor'));
        const motivo = interaction.fields.getTextInputValue('input_motivo').trim();

        if (!userId || isNaN(valor) || valor <= 0 || !motivo) {
            return interaction.reply({ content: '❌ Dados inválidos. Verifique o ID, valor e motivo.', flags: 64 });
        }

        try {
            await pool.query(
                "INSERT INTO conduta (guild_id, user_id, tipo, motivo, valor, aplicado_por) VALUES ($1, $2, 'multa', $3, $4, $5)",
                [interaction.guildId, userId, motivo, valor, interaction.user.id]
            );

            await interaction.reply({
                content: `💰 **Multa aplicada!**\n\n**Membro:** <@${userId}>\n**Valor:** \`R$${valor.toLocaleString()}\`\n**Motivo:** ${motivo}\n**Aplicado por:** <@${interaction.user.id}>`,
                flags: 64
            });

        } catch (error) {
            console.error('[ERRO] Falha ao aplicar multa:', error);
            await interaction.reply({ content: 'Erro ao aplicar multa.', flags: 64 });
        }
    }
};

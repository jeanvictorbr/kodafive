// src/interactions/modals/modal_salvar_entrega.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_salvar_entrega',
    async execute(client, interaction) {
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd_entregue'));
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (isNaN(qtd) || qtd <= 0) {
            return interaction.reply({ content: '❌ Insira um valor numérico válido, chefe!', flags: 64 });
        }

        try {
            // Salva a entrega no banco
            await pool.query(
                "INSERT INTO entregas_farm (guild_id, user_id, quantidade) VALUES ($1, $2, $3)",
                [guildId, userId, qtd]
            );

            await interaction.reply({ content: `✅ **Entrega registrada!** Mais \`${qtd.toLocaleString()}\` somados na sua conta. Boa!`, flags: 64 });

        } catch (error) {
            console.error('[ERRO] Falha ao salvar entrega:', error);
            await interaction.reply({ content: 'Erro ao salvar a entrega no banco.', flags: 64 });
        }
    }
};
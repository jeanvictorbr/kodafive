// src/interactions/modals/modal_registrar_entrega_farm.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_registrar_entrega_farm',
    async execute(client, interaction) {
        const metaId = parseInt(interaction.fields.getTextInputValue('input_meta_id'));
        const quantidade = parseInt(interaction.fields.getTextInputValue('input_quantidade'));
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (isNaN(metaId) || isNaN(quantidade) || quantidade <= 0) {
            return interaction.reply({ content: '❌ Dados inválidos. Confira o ID do item e a quantidade.', flags: 64 });
        }

        try {
            // Confere se a meta existe
            const metaCheck = await pool.query('SELECT item_nome FROM meta_farm_config WHERE id = $1 AND guild_id = $2', [metaId, guildId]);
            if (metaCheck.rows.length === 0) {
                return interaction.reply({ content: '❌ ID de meta não encontrado. Verifique os IDs ativos no painel.', flags: 64 });
            }

            const itemName = metaCheck.rows[0].item_nome;

            // Salva no banco
            await pool.query(
                "INSERT INTO entregas_farm (guild_id, user_id, meta_id, quantidade) VALUES ($1, $2, $3, $4)",
                [guildId, userId, metaId, quantidade]
            );

            await interaction.reply({ 
                content: `✅ **Entrega de ${quantidade.toLocaleString()}x ${itemName} registrada com sucesso!**\n\n📌 *Dica da Diretoria:* Se o seu cargo exige comprovante, mande o print do depósito/baú aqui neste canal marcando a staff.`, 
                flags: 64 
            });

        } catch (error) {
            console.error('[ERRO] Falha ao registrar entrega:', error);
            await interaction.reply({ content: 'Erro interno ao processar a entrega.', flags: 64 });
        }
    }
};
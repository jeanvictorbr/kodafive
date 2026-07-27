// src/interactions/modals/modal_salvar_entrega.js
const { pool } = require('../../database/db');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');

module.exports = {
    customId: 'modal_salvar_entrega',
    async execute(client, interaction) {
        // Puxa os dados que o usuário digitou no modal
        const metaId = parseInt(interaction.fields.getTextInputValue('input_meta_id'));
        const qtd = parseInt(interaction.fields.getTextInputValue('input_quantidade'));
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (isNaN(metaId) || isNaN(qtd) || qtd <= 0) {
            return interaction.reply({ content: '❌ Dados inválidos. Verifique o ID da meta e a quantidade informada.', flags: 64 });
        }

        try {
            // Confere se o ID da meta existe e puxa o nome do item
            const metaCheck = await pool.query('SELECT item_nome FROM meta_farm_config WHERE id = $1 AND guild_id = $2', [metaId, guildId]);
            
            if (metaCheck.rowCount === 0) {
                return interaction.reply({ content: '❌ ID de meta não encontrado. Verifique os IDs ativos no painel.', flags: 64 });
            }

            const itemName = metaCheck.rows[0].item_nome;

            // Salva a entrega no banco vinculada àquela meta
            await pool.query(
                "INSERT INTO entregas_farm (guild_id, user_id, meta_id, quantidade) VALUES ($1, $2, $3, $4)",
                [guildId, userId, metaId, qtd]
            );

            await interaction.reply({ 
                content: `✅ **Entrega registrada!** Foram adicionados \`${qtd.toLocaleString()}x ${itemName}\` na sua conta.\n\n📌 *Lembrete da Diretoria:* Mande o **print do depósito/baú** aqui neste canal para a staff auditar.`, 
                flags: 64 
            });

            // Dispara o gatilho para a barra de progresso do painel andar na hora!
            await atualizarVitrineFarm(client, guildId);

        } catch (error) {
            console.error('[ERRO] Falha ao salvar entrega:', error);
            await interaction.reply({ content: 'Erro ao salvar a entrega no banco.', flags: 64 });
        }
    }
};
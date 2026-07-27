const { pool } = require('../../database/db');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');
const { verificarMetasBatidas } = require('../../utils/verificarMetasBatidas');

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
            const metaCheck = await pool.query('SELECT item_nome FROM meta_farm_config WHERE id = $1 AND guild_id = $2', [metaId, guildId]);
            if (metaCheck.rows.length === 0) {
                return interaction.reply({ content: '❌ ID de meta não encontrado. Verifique os IDs ativos no painel.', flags: 64 });
            }

            const itemName = metaCheck.rows[0].item_nome;

            await pool.query(
                "INSERT INTO entregas_farm (guild_id, user_id, meta_id, quantidade) VALUES ($1, $2, $3, $4)",
                [guildId, userId, metaId, quantidade]
            );

            await interaction.reply({
                content: `✅ **Entrega de ${quantidade.toLocaleString()}x ${itemName} registrada com sucesso!**\n\n📸 Agora **envia o print do depósito** na nossa DM pra gente salvar o comprovante.`,
                flags: 64
            });

            await atualizarVitrineFarm(client, guildId);
            await verificarMetasBatidas(client, guildId);

            const user = await client.users.fetch(userId).catch(() => null);
            if (user) {
                await user.send(`📸 **Comprovante de Entrega**\n\nSua entrega de \`${quantidade.toLocaleString()}x ${itemName}\] foi registrada! Manda o **print do depósito/baú** como imagem aqui mesmo pra gente anexar ao registro.\n\n*Se não tiver comprovante, só ignora essa mensagem.*`).catch(() => {});
            }

        } catch (error) {
            console.error('[ERRO] Falha ao registrar entrega:', error);
            await interaction.reply({ content: 'Erro interno ao processar a entrega.', flags: 64 });
        }
    }
};
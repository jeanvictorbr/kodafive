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
                content: `📸 **COMPROVANTE OBRIGATÓRIO!**\n\nSua entrega de \`${quantidade.toLocaleString()}x ${itemName}\] foi **registrada**, mas **não será validada** até você enviar o **print do depósito** como comprovante.\n\n✅ Envie o print na nossa **DM privada** agora mesmo para concluir.\n❌ Sem comprovante, a entrega será ignorada.`,
                flags: 64
            });

            await atualizarVitrineFarm(client, guildId);
            await verificarMetasBatidas(client, guildId);

            const user = await client.users.fetch(userId).catch(() => null);
            if (user) {
                await user.send(`📸 **COMPROVANTE OBRIGATÓRIO!**\n\nSua entrega de \`${quantidade.toLocaleString()}x ${itemName}\] foi registrada, mas **precisa do print do depósito** pra ser validada.\n\n👉 Manda o **print** aqui mesmo como imagem.\n⏳ Você tem até o fim do ciclo pra enviar.\n❌ Sem comprovante, a entrega não conta.`).catch(() => {});
            }

        } catch (error) {
            console.error('[ERRO] Falha ao registrar entrega:', error);
            await interaction.reply({ content: 'Erro interno ao processar a entrega.', flags: 64 });
        }
    }
};
// src/interactions/modals/modal_del_meta.js
const { pool } = require('../../database/db'); 
const { buildPainelFarm } = require('../../utils/buildPainelFarm');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');

module.exports = {
    customId: 'modal_del_meta',
    async execute(interaction) {
        // Puxa o ID digitado
        const idItem = interaction.fields.getTextInputValue('input_id_meta_del');

        // Verificação cria
        if (isNaN(idItem)) {
            return interaction.reply({
                flags: 32832,
                components: [{
                    type: 17,
                    accent_color: 15548997,
                    components: [{ type: 10, content: '⚠️ **Atenção:** O ID informado precisa ser um número.' }]
                }]
            });
        }

        try {
            // Fogo na babilônia: DELETE no banco
            const deletar = await pool.query(
                'DELETE FROM meta_farm_config WHERE id = $1 AND guild_id = $2 RETURNING id',
                [Number(idItem), interaction.guildId]
            );

            if (deletar.rowCount === 0) {
                return interaction.reply({
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 15548997,
                        components: [{ type: 10, content: `❌ **Deu ruim.** O item de ID \`${idItem}\` não foi encontrado na base.` }]
                    }]
                });
            }

            // 1. Gera os componentes novos sem o item apagado
            const payloadNovo = await buildPainelFarm(interaction);

            // 2. Dá o update limpo na mensagem do discord
            await interaction.update({ components: payloadNovo });

            // 3. Atualiza a vitrine pública
            if (atualizarVitrineFarm) {
                await atualizarVitrineFarm(interaction.client, interaction.guildId);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao excluir item da meta:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Erro interno ao tentar excluir a cota.', ephemeral: true });
            }
        }
    }
};
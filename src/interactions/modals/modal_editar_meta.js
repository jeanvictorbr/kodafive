// src/interactions/modals/modal_editar_meta.js
const { pool } = require('../../database/db'); // Ajuste o nível das pastas conforme sua estrutura
const { buildPainelFarm } = require('../../utils/buildPainelFarm');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');

module.exports = {
    customId: 'modal_editar_meta',
    // Recebendo os dois parâmetros pra evitar erro de ordem
    async execute(param1, param2) {
        // Macete: Acha a interação de verdade procurando quem tem a propriedade '.fields'
        const interaction = param1?.fields ? param1 : param2;

        if (!interaction || !interaction.fields) {
            return console.log('❌ [ERRO] O interactionCreate.js não enviou a interação certa pro Modal.');
        }

        // Puxa os dados que o líder preencheu
        const idItem = interaction.fields.getTextInputValue('input_id_meta');
        const novoNome = interaction.fields.getTextInputValue('input_novo_nome');
        const novaQtd = interaction.fields.getTextInputValue('input_nova_qtd');

        // Proteção contra número zoado
        if (isNaN(idItem) || isNaN(novaQtd)) {
            return interaction.reply({
                flags: 32832, // Components V2 + Ephemeral
                components: [{
                    type: 17,
                    accent_color: 15548997, // Vermelho
                    components: [{ type: 10, content: '⚠️ **Aí não, chefia!** O ID do item e a Nova Quantidade precisam ser números.' }]
                }]
            });
        }

        try {
            // Executa o UPDATE no banco, garantindo que é da guild certa pra evitar exploit
            const update = await pool.query(
                'UPDATE meta_farm_config SET item_nome = $1, meta_quantidade = $2 WHERE id = $3 AND guild_id = $4 RETURNING id',
                [novoNome, Number(novaQtd), Number(idItem), interaction.guildId]
            );

            if (update.rowCount === 0) {
                return interaction.reply({
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 15548997,
                        components: [{ type: 10, content: `❌ **Não achei esse ID.** Tem certeza que o ID \`${idItem}\` existe nessa facção?` }]
                    }]
                });
            }

            // 1. Reconstrói o layout do painel de gestão com os novos dados
            const payloadNovo = await buildPainelFarm(interaction);

            // 2. Atualiza a mensagem da interface na mesma hora pro líder (efeito piscou-atualizou)
            await interaction.update({ components: payloadNovo });

            // 3. Atualiza a vitrine pública da rapaziada
            if (typeof atualizarVitrineFarm === 'function') {
                await atualizarVitrineFarm(interaction.client, interaction.guildId);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao editar item da meta:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Erro interno no banco de dados.', ephemeral: true });
            }
        }
    }
};
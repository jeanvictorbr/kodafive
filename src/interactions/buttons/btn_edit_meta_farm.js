// src/interactions/buttons/btn_edit_meta_farm.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'btn_edit_meta_farm',
    // Recebemos dois parâmetros genéricos pra não dar erro de ordem do seu handler
    async execute(param1, param2) {
        // Macete: Descobre automaticamente qual dos dois é a interação que tem a função de Modal
        const interaction = param1?.showModal ? param1 : param2;

        if (!interaction || typeof interaction.showModal !== 'function') {
            return console.log('❌ [ERRO] O seu interactionCreate.js não está enviando a interação corretamente para os botões.');
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_editar_meta')
            .setTitle('✏️ Editar Item da Meta');

        // Pede o ID do item
        const inputId = new TextInputBuilder()
            .setCustomId('input_id_meta')
            .setLabel('ID do Item (veja na lista acima)')
            .setPlaceholder('Ex: 1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Pede o novo nome
        const inputNome = new TextInputBuilder()
            .setCustomId('input_novo_nome')
            .setLabel('Novo Nome do Item')
            .setPlaceholder('Ex: Maconha')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Pede a nova quantidade
        const inputQtd = new TextInputBuilder()
            .setCustomId('input_nova_qtd')
            .setLabel('Nova Quantidade Global')
            .setPlaceholder('Ex: 15000')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputId),
            new ActionRowBuilder().addComponents(inputNome),
            new ActionRowBuilder().addComponents(inputQtd)
        );

        await interaction.showModal(modal);
    }
};
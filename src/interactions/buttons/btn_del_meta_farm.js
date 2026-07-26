// src/interactions/buttons/btn_del_meta_farm.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'btn_del_meta_farm',
    async execute(param1, param2) {
        // O mesmo macete pra garantir que estamos usando a interação certa
        const interaction = param1?.showModal ? param1 : param2;

        if (!interaction || typeof interaction.showModal !== 'function') {
            return console.log('❌ [ERRO] O seu interactionCreate.js não está enviando a interação corretamente para os botões.');
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_del_meta')
            .setTitle('🗑️ Excluir Item da Meta');

        const inputId = new TextInputBuilder()
            .setCustomId('input_id_meta_del')
            .setLabel('ID do Item para apagar (veja na lista)')
            .setPlaceholder('Ex: 2')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(inputId));

        await interaction.showModal(modal);
    }
};
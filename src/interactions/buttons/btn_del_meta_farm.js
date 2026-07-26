// src/interactions/buttons/btn_del_meta_farm.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'btn_del_meta_farm',
    async execute(interaction) {
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
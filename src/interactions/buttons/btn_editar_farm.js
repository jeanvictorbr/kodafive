const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'btn_editar_farm',
    async execute(interaction) {
        // [VERIFICAÇÃO DE CARGO] Barra os curioso
        // if (!interaction.member.roles.cache.has('ID_CARGO_LIDER')) return;

        const modal = new ModalBuilder()
            .setCustomId('modal_editar_farm')
            .setTitle('Editar Ciclo de Farm');

        const inputMetaNova = new TextInputBuilder()
            .setCustomId('input_nova_meta')
            .setLabel('Nova Meta Global (Apenas números)')
            .setPlaceholder('Ex: 1000')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const inputItem = new TextInputBuilder()
            .setCustomId('input_item_nome')
            .setLabel('O que a tropa tá farmando?')
            .setPlaceholder('Ex: Pacotes de Erva')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(inputMetaNova);
        const row2 = new ActionRowBuilder().addComponents(inputItem);

        modal.addComponents(row1, row2);
        await interaction.showModal(modal);
    }
};
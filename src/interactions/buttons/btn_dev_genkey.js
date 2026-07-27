module.exports = {
    customId: 'btn_dev_genkey',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_dev_genkey',
            title: 'Gerar Key VIP',
            components: [
                {
                    type: 18,
                    label: 'Quantidade (1-50)',
                    component: { type: 4, custom_id: "input_qtd", style: 1, value: '1', placeholder: "1", required: true }
                }
            ]
        });
    }
};

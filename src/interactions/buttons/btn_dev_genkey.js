module.exports = {
    customId: 'btn_dev_genkey',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_dev_genkey',
            title: 'Gerar Key VIP',
            components: [
                {
                    type: 18,
                    label: 'Quantidade de keys (1-50)',
                    component: { type: 4, custom_id: "input_qtd", style: 1, value: '1', placeholder: "1", required: true }
                },
                {
                    type: 18,
                    label: 'Dias de duração (0 = vitalício)',
                    component: { type: 4, custom_id: "input_dias", style: 1, value: '30', placeholder: "30", required: true }
                },
                {
                    type: 18,
                    label: 'Máximo de usos por key (1-999)',
                    component: { type: 4, custom_id: "input_usos", style: 1, value: '1', placeholder: "1", required: true }
                }
            ]
        });
    }
};

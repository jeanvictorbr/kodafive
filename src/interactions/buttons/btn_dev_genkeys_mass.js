module.exports = {
    customId: 'btn_dev_genkeys_mass',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_dev_genkeys_mass',
            title: 'Gerar Keys em Massa',
            components: [
                {
                    type: 18,
                    label: 'Quantidade de keys (1-500)',
                    component: { type: 4, custom_id: "input_qtd", style: 1, value: '100', placeholder: "100", required: true }
                }
            ]
        });
    }
};

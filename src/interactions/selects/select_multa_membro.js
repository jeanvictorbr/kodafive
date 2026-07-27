module.exports = {
    customId: 'select_multa_membro',
    async execute(client, interaction) {
        const targetId = interaction.values[0];
        const modal = {
            type: 9,
            data: {
                custom_id: `modal_tribunal_multa_${targetId}`,
                title: "Aplicar Multa",
                components: [
                    {
                        type: 18,
                        label: "Valor da Multa (em R$)",
                        component: { type: 4, custom_id: "input_valor", style: 1, placeholder: "5000", required: true }
                    },
                    {
                        type: 18,
                        label: "Motivo",
                        component: { type: 4, custom_id: "input_motivo", style: 2, placeholder: "Desrespeito às regras da facção", required: true, max_length: 500 }
                    }
                ]
            }
        };
        await interaction.showModal(modal.data);
    }
};

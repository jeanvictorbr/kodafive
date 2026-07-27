module.exports = {
    customId: 'btn_tribunal_multa',
    async execute(client, interaction) {
        const modal = {
            type: 9,
            data: {
                custom_id: "modal_tribunal_multa",
                title: "Aplicar Multa",
                components: [
                    {
                        type: 18,
                        label: "ID do Membro",
                        component: { type: 4, custom_id: "input_user_id", style: 1, placeholder: "123456789", required: true }
                    },
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

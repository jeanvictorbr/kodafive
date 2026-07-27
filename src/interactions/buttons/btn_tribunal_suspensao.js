module.exports = {
    customId: 'btn_tribunal_suspensao',
    async execute(client, interaction) {
        const modal = {
            type: 9,
            data: {
                custom_id: "modal_tribunal_suspensao",
                title: "Suspender Membro",
                components: [
                    {
                        type: 18,
                        label: "ID do Membro",
                        component: { type: 4, custom_id: "input_user_id", style: 1, placeholder: "123456789", required: true }
                    },
                    {
                        type: 18,
                        label: "Duração (em horas)",
                        component: { type: 4, custom_id: "input_duracao", style: 1, placeholder: "24", required: true }
                    },
                    {
                        type: 18,
                        label: "Motivo da Suspensão",
                        component: { type: 4, custom_id: "input_motivo", style: 2, placeholder: "Conduta inadequada grave", required: true, max_length: 500 }
                    }
                ]
            }
        };
        await interaction.showModal(modal.data);
    }
};

module.exports = {
    customId: 'select_suspensao_membro',
    async execute(client, interaction) {
        const targetId = interaction.values[0];
        const modal = {
            type: 9,
            data: {
                custom_id: `modal_tribunal_suspensao_${targetId}`,
                title: "Suspender Membro",
                components: [
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

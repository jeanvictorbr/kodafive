module.exports = {
    customId: 'select_advertencia_membro',
    async execute(client, interaction) {
        const targetId = interaction.values[0];
        const modal = {
            type: 9,
            data: {
                custom_id: `modal_tribunal_advertencia_${targetId}`,
                title: "Dar Advertência",
                components: [
                    {
                        type: 18,
                        label: "Motivo da Advertência",
                        component: { type: 4, custom_id: "input_motivo", style: 2, placeholder: "Descumprimento de ordens", required: true, max_length: 500 }
                    }
                ]
            }
        };
        await interaction.showModal(modal.data);
    }
};

module.exports = {
    customId: 'btn_tribunal_advertencia',
    async execute(client, interaction) {
        const modal = {
            type: 9,
            data: {
                custom_id: "modal_tribunal_advertencia",
                title: "Dar Advertência",
                components: [
                    {
                        type: 18,
                        label: "ID do Membro",
                        component: { type: 4, custom_id: "input_user_id", style: 1, placeholder: "123456789", required: true }
                    },
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

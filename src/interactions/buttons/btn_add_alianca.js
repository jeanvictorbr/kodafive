module.exports = {
    customId: 'btn_add_alianca',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_add_alianca',
            title: 'Nova Relação',
            components: [
                {
                    type: 18,
                    label: 'Nome da facção',
                    component: { type: 4, custom_id: "input_nome", style: 1, min_length: 1, max_length: 100, placeholder: "Família Koda", required: true }
                },
                {
                    type: 18,
                    label: 'Tipo (alianca ou rival)',
                    component: { type: 4, custom_id: "input_tipo", style: 1, min_length: 1, max_length: 10, placeholder: "alianca", required: true }
                },
                {
                    type: 18,
                    label: 'Descrição (opcional)',
                    component: { type: 4, custom_id: "input_desc", style: 2, max_length: 500, placeholder: "Facção aliada desde 2024, parceria no farm e guerra.", required: false }
                },
                {
                    type: 18,
                    label: 'URL do ícone/brasão (opcional)',
                    component: { type: 4, custom_id: "input_icone", style: 1, max_length: 500, placeholder: "https://i.ibb.co/...", required: false }
                }
            ]
        });
    }
};

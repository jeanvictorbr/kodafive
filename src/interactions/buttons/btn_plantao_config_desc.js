module.exports = {
    customId: 'btn_plantao_config_desc',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_plantao_config_desc',
            title: "📝 Alterar Descrição do Plantão",
            components: [{
                type: 18,
                label: "Nova descrição (aparece no topo do painel):",
                component: { type: 4, custom_id: "input_desc_texto", style: 2, min_length: 1, max_length: 300, placeholder: "Organize a escala de serviço da liderança.", required: true }
            }]
        });
    }
};

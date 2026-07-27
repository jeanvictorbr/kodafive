module.exports = {
    customId: 'btn_plantao_config_desc',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        await interaction.showModal({
            custom_id: `modal_plantao_config_desc_p${pagina}`,
            title: "📝 Alterar Descrição do Plantão",
            components: [{
                type: 18,
                label: "Nova descrição (aparece no topo do painel):",
                component: { type: 4, custom_id: "input_desc_texto", style: 2, min_length: 1, max_length: 300, placeholder: "Controle quem está de serviço na facção.", required: true }
            }]
        });
    }
};

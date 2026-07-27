module.exports = {
    customId: 'btn_plantao_config_banner',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        await interaction.showModal({
            custom_id: `modal_plantao_config_banner_p${pagina}`,
            title: "🖼 Alterar Banner do Plantão",
            components: [{
                type: 18,
                label: "URL da imagem do banner:",
                component: { type: 4, custom_id: "input_banner_url", style: 1, min_length: 10, max_length: 500, placeholder: "https://i.ibb.co/seubanner.png", required: true }
            }]
        });
    }
};

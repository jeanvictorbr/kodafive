module.exports = {
    customId: 'btn_config_painel_visual',
    async execute(client, interaction) {
        const modalVisual = {
            type: 9,
            data: {
                custom_id: "modal_painel_visual",
                title: "Visual do Painel Público",
                components: [
                    { type: 18, label: "Título do Painel", component: { type: 4, custom_id: "input_titulo", style: 1, max_length: 100, placeholder: "Ex: 📝 Recrutamento da Facção", required: true } },
                    { type: 18, label: "Descrição", component: { type: 4, custom_id: "input_desc", style: 2, max_length: 500, placeholder: "Manda o papo pros novatos...", required: true } },
                    { type: 18, label: "Link do Banner (URL da Imagem .png)", component: { type: 4, custom_id: "input_banner", style: 1, required: true } },
                    { type: 18, label: "Rodapé", component: { type: 4, custom_id: "input_rodape", style: 1, max_length: 50, required: true } }
                ]
            }
        };
        await interaction.showModal(modalVisual.data);
    }
};
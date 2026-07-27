module.exports = {
    customId: 'btn_enviar_sugestao',
    async execute(client, interaction) {
        await interaction.showModal({
            custom_id: 'modal_enviar_sugestao',
            title: 'Enviar Sugestão',
            components: [
                {
                    type: 18,
                    label: 'Título da sugestão',
                    component: { type: 4, custom_id: "input_titulo", style: 1, min_length: 3, max_length: 100, placeholder: "Sistema de barganha entre facções", required: true }
                },
                {
                    type: 18,
                    label: 'Descreva sua ideia',
                    component: { type: 4, custom_id: "input_descricao", style: 2, max_length: 1000, placeholder: "Explica aí tua ideia com detalhes...", required: true }
                }
            ]
        });
    }
};

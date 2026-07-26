// src/interactions/buttons/btn_abrir_modal_novato.js
module.exports = {
    customId: 'btn_abrir_modal_novato',
    async execute(client, interaction) {
        const modalPayload = {
            type: 9, 
            data: {
                custom_id: "modal_recrutamento_form",
                title: "Ficha de Recrutamento",
                components: [
                    { type: 18, label: "Qual o seu Nome RP?", component: { type: 4, custom_id: "rec_nomerp", style: 1, min_length: 3, max_length: 50, required: true } },
                    { type: 18, label: "Qual o seu Passaporte (ID)?", component: { type: 4, custom_id: "rec_passaporte", style: 1, min_length: 1, max_length: 10, required: true } },
                    { type: 18, label: "Experiência no crime:", component: { type: 4, custom_id: "rec_experiencia", style: 2, min_length: 10, max_length: 1000, required: true } }
                ]
            }
        };
        await interaction.showModal(modalPayload.data);
    }
};
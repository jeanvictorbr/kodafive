// src/interactions/buttons/btn_abrir_modal_entrega.js
module.exports = {
    customId: 'btn_abrir_modal_entrega',
    async execute(client, interaction) {
        const modalEntrega = {
            type: 9,
            data: {
                custom_id: "modal_salvar_entrega",
                title: "Registrar Entrega de Farm",
                components: [
                    { 
                        type: 18, 
                        label: "Quantidade Entregue (Apenas números)", 
                        component: { type: 4, custom_id: "input_qtd_entregue", style: 1, placeholder: "Ex: 250", required: true } 
                    }
                ]
            }
        };
        await interaction.showModal(modalEntrega.data);
    }
};
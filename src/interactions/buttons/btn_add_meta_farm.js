// src/interactions/buttons/btn_add_meta_farm.js
module.exports = {
    customId: 'btn_add_meta_farm',
    async execute(client, interaction) {
        const modalAddMeta = {
            type: 9,
            data: {
                custom_id: "modal_salvar_nova_meta",
                title: "Adicionar Item à Meta",
                components: [
                    { 
                        type: 18, 
                        label: "Nome do Item (Ex: Colete, C4, Dinheiro Sujo)", 
                        component: { type: 4, custom_id: "input_item", style: 1, required: true } 
                    },
                    { 
                        type: 18, 
                        label: "Quantidade Meta", 
                        component: { type: 4, custom_id: "input_qtd", style: 1, placeholder: "Ex: 1000", required: true } 
                    }
                ]
            }
        };
        await interaction.showModal(modalAddMeta.data);
    }
};
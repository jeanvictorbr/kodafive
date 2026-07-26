// src/interactions/buttons/btn_mudar_ciclo_farm.js
module.exports = {
    customId: 'btn_mudar_ciclo_farm',
    async execute(client, interaction) {
        const modalCiclo = {
            type: 9,
            data: {
                custom_id: "modal_salvar_ciclo_farm",
                title: "Alterar Ciclo de Reset",
                components: [
                    { 
                        type: 18, 
                        label: "Digite: diario, semanal ou mensal", 
                        component: { type: 4, custom_id: "input_novo_ciclo", style: 1, placeholder: "semanal", required: true } 
                    }
                ]
            }
        };
        await interaction.showModal(modalCiclo.data);
    }
};
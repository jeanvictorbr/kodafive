// src/interactions/buttons/btn_resgatar_vip.js
module.exports = {
    customId: 'btn_resgatar_vip',
    async execute(client, interaction) {
        const modalVip = {
            type: 9,
            data: {
                custom_id: "modal_resgatar_vip",
                title: "Ativação VIP Koda Studios",
                components: [
                    {
                        type: 18,
                        label: "Insira a chave recebida na compra:",
                        component: { type: 4, custom_id: "input_vip_key", style: 1, min_length: 10, max_length: 30, placeholder: "KODA-XXXX-XXXX", required: true }
                    }
                ]
            }
        };
        await interaction.showModal(modalVip.data);
    }
};
module.exports = {
    customId: 'btn_dev_doar_vip',
    async execute(client, interaction) {
        const modalDoar = {
            type: 9,
            data: {
                custom_id: "modal_dev_doar_vip",
                title: "🎁 Doar VIP",
                components: [
                    {
                        type: 18,
                        label: "ID do servidor (guild_id):",
                        component: { type: 4, custom_id: "input_guild_id", style: 1, min_length: 17, max_length: 30, placeholder: "Insira o ID do servidor", required: true }
                    },
                    {
                        type: 18,
                        label: "Dias de duração (0 = vitalício):",
                        component: { type: 4, custom_id: "input_dias", style: 1, min_length: 1, max_length: 4, placeholder: "7", required: true }
                    },
                    {
                        type: 18,
                        label: "Motivo / observação (opcional):",
                        component: { type: 4, custom_id: "input_motivo", style: 2, min_length: 0, max_length: 200, placeholder: "Ex: Sorteio do Discord", required: false }
                    }
                ]
            }
        };
        await interaction.showModal(modalDoar.data);
    }
};

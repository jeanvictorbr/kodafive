module.exports = {
    customId: 'btn_tribunal_multa',
    async execute(client, interaction) {
        await interaction.reply({
            content: "💰 Selecione o membro para aplicar a multa:",
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 5, custom_id: "select_multa_membro", placeholder: "Digite o nome do membro..." }
                    ]
                }
            ]
        });
    }
};

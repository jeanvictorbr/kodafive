module.exports = {
    customId: 'btn_tribunal_suspensao',
    async execute(client, interaction) {
        await interaction.reply({
            content: "🔒 Selecione o membro para suspender:",
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 5, custom_id: "select_suspensao_membro", placeholder: "Digite o nome do membro..." }
                    ]
                }
            ]
        });
    }
};

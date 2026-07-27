module.exports = {
    customId: 'btn_tribunal_advertencia',
    async execute(client, interaction) {
        await interaction.reply({
            content: "📋 Selecione o membro para advertir:",
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 5, custom_id: "select_advertencia_membro", placeholder: "Digite o nome do membro..." }
                    ]
                }
            ]
        });
    }
};

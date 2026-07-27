module.exports = {
    customId: 'btn_tribunal_ficha',
    async execute(client, interaction) {
        await interaction.reply({
            content: "👤 Selecione o membro que quer consultar:",
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 5, custom_id: "select_ver_ficha", placeholder: "Selecione um membro..." }
                    ]
                }
            ]
        });
    }
};

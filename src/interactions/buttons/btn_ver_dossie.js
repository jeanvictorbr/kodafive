module.exports = {
    customId: 'btn_ver_dossie',
    async execute(client, interaction) {
        await interaction.reply({
            content: "👤 Selecione o membro para ver o dossiê completo:",
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 5, custom_id: "select_ver_dossie", placeholder: "Selecione um membro..." }
                    ]
                }
            ]
        });
    }
};

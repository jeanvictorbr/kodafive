module.exports = {
    customId: 'btn_add_tag',
    async execute(client, interaction) {
        await interaction.reply({
            content: '🎯 Selecione o cargo que terá uma tag automática:',
            flags: 64,
            components: [
                {
                    type: 1,
                    components: [
                        { type: 6, custom_id: "select_add_tag_role", placeholder: "Escolha um cargo..." }
                    ]
                }
            ]
        });
    }
};

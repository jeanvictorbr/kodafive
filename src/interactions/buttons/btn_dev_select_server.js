const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dev_select_server',
    async execute(client, interaction) {
        const guilds = client.guilds.cache
            .sort((a, b) => b.memberCount - a.memberCount)
            .first(25);

        const options = guilds.map(g => ({
            label: g.name.length > 25 ? g.name.substring(0, 22) + '...' : g.name,
            value: g.id,
            description: `${g.memberCount} membros`
        }));

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 7,
                data: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 16711680,
                        components: [
                            { type: 10, content: "# 🔍 Selecionar Servidor\nEscolha um servidor pra ver os detalhes." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [{
                                    type: 3,
                                    custom_id: "select_dev_server",
                                    placeholder: "Escolha um servidor...",
                                    options: options
                                }]
                            }
                        ]
                    }]
                }
            }
        });
    }
};

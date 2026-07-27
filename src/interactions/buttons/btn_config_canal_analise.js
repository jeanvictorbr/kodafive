const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_config_canal_analise',
    async execute(client, interaction) {
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 7,
                data: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 16711680,
                        components: [
                            { type: 10, content: "# 📢 Selecionar Canal de Análise\nEscolhe o canal onde as sugestões vão aparecer pra galera discutir." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [{
                                    type: 8,
                                    custom_id: "select_canal_analise",
                                    placeholder: "Escolha um canal de texto...",
                                    channel_types: [0]
                                }]
                            }
                        ]
                    }]
                }
            }
        });
    }
};

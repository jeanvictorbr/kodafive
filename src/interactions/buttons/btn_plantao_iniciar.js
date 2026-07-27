const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_plantao_iniciar',
    async execute(client, interaction) {
        const cargos = [
            { label: '🏛️ Liderança', value: 'Liderança', description: 'Coordenação geral' },
            { label: '📋 Recrutador', value: 'Recrutador', description: 'Responsável por recrutas' },
            { label: '⚖️ Gerente', value: 'Gerente', description: 'Gestão de membros' },
        ];

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 7, data: {
                    flags: 32832,
                    components: [{
                        type: 17, accent_color: 3447003,
                        components: [
                            { type: 10, content: "### ✅ Qual função tu vai exercer agora?" },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [{
                                    type: 3,
                                    custom_id: 'select_plantao_cargo',
                                    placeholder: 'Escolhe a função',
                                    options: cargos
                                }]
                            }
                        ]
                    }]
                }
            }
        });
    }
};

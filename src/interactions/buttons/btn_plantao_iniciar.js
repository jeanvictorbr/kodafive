const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_plantao_iniciar',
    async execute(client, interaction) {
        const ehV2 = interaction.message?.flags?.bitfield & 32832;

        const cargos = [
            { label: '🏛️ Liderança', value: 'Liderança', description: 'Coordenação geral' },
            { label: '📋 Recrutador', value: 'Recrutador', description: 'Responsável por recrutas' },
            { label: '⚖️ Gerente', value: 'Gerente', description: 'Gestão de membros' },
            { label: '🎯 Suporte', value: 'Suporte', description: 'Apoio aos membros' },
        ];

        if (ehV2) {
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 7, data: { flags: 32832, components: [{
                        type: 17, accent_color: 3447003,
                        components: [
                            { type: 10, content: "### 🎯 Escolha sua função\nSelecione qual cargo vai exercer neste plantão:" },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [{
                                    type: 3,
                                    custom_id: 'select_plantao_cargo',
                                    placeholder: 'Escolha sua função',
                                    options: cargos
                                }]
                            }
                        ]
                    }] }
                }
            });
        } else {
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 7, data: {
                        embeds: [{
                            color: 3447003,
                            title: '🎯 Escolha sua função',
                            description: 'Selecione qual cargo vai exercer neste plantão:'
                        }],
                        components: [{
                            type: 1,
                            components: [{
                                type: 3,
                                custom_id: 'select_plantao_cargo',
                                placeholder: 'Escolha sua função',
                                options: cargos
                            }]
                        }]
                    }
                }
            });
        }
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_plantao_iniciar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const ativo = await pool.query(
            "SELECT id FROM plantao WHERE guild_id = $1 AND user_id = $2 AND status = 'ativo' AND tipo = 'agora'",
            [guildId, userId]
        );

        if (ativo.rows.length > 0) {
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 4, data: { flags: 32832, components: [{
                    type: 17, accent_color: 15548997,
                    components: [
                        { type: 10, content: '# ⚠️ Tu já tá na ativa\nEncerra o plantão atual primeiro antes de assumir outro.' }
                    ]
                }] } }
            });
        }

        const cargos = [
            { label: '🏛️ Liderança', value: 'Liderança', description: 'Coordenação geral' },
            { label: '📋 Recrutador', value: 'Recrutador', description: 'Responsável por recrutas' },
            { label: '⚖️ Gerente', value: 'Gerente', description: 'Gestão de membros' },
        ];

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4, data: {
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

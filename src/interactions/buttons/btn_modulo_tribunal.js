const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_modulo_tribunal',
    async execute(client, interaction) {
        const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        const menuTribunal = [
            {
                type: 17,
                accent_color: 15548997,
                components: [
                    {
                        type: 9,
                        components: [
                            { type: 10, content: "# ⚖️ MÓDULO: Tribunal & Progresso\nSistema disciplinar e de evolução dos membros." }
                        ],
                        accessory: { type: 11, media: { url: avatarUrl } }
                    },
                    { type: 14, spacing: 1, divider: true },

                    {
                        type: 9,
                        components: [{ type: 10, content: "### ⚖️ Tribunal do Crime\nMultas, advertências, suspensões e dossiê completo dos membros." }],
                        accessory: { type: 2, style: 4, custom_id: "btn_submodulo_tribunal", label: "Acessar", emoji: { name: "⚖️" } }
                    },

                    {
                        type: 9,
                        components: [{ type: 10, content: "### ⭐ XP & Níveis\nRanking de experiência, progresso dos membros e dashboard de evolução." }],
                        accessory: { type: 2, style: 3, custom_id: "btn_submodulo_xp", label: "Acessar", emoji: { name: "⭐" } }
                    },

                    { type: 14, spacing: 1, divider: true },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                        ]
                    },
                    { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
                ]
            }
        ];

        try {
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: menuTribunal } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir menu do tribunal:', error);
        }
    }
};

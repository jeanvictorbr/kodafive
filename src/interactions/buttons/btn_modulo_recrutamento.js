// src/interactions/buttons/btn_modulo_recrutamento.js
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_modulo_recrutamento',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        // Nova interface intermediária (Menu de Submódulos)
        const menuGestao = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    {
                        type: 9, // Section com foto do usuário
                        components: [
                            { type: 10, content: "# 📋 MÓDULO: Gestão da Rapaziada\nSelecione qual sistema você quer acessar ou configurar agora, chefe." }
                        ],
                        accessory: { type: 11, media: { url: avatarUrl } }
                    },
                    { type: 14, spacing: 1, divider: true },
                    
                    // --- SUBMÓDULO: RECRUTAMENTO ---
                    {
                        type: 9,
                        components: [{ type: 10, content: "### 📝 Recrutamento & RH\nConfiguração de cargos, canais, ranking e painel público." }],
                        accessory: { type: 2, style: 1, custom_id: "btn_submodulo_rec", label: "Acessar", emoji: { name: "📝" } }
                    },
                    
                    // --- SUBMÓDULO: BATE PONTO ---
                    {
                        type: 9,
                        components: [{ type: 10, content: "### ⏱️ Bate Ponto\nControle de horas trabalhadas e presença da staff na cidade." }],
                        accessory: { type: 2, style: 2, custom_id: "btn_submodulo_ponto", label: "Acessar", emoji: { name: "⏱️" } }
                    },

                    // --- SUBMÓDULO: METAS DE FARM ---
                    {
                        type: 9,
                        components: [{ type: 10, content: "### 📦 Metas de Farm\nDefinição e relatórios de entregas da rapaziada." }],
                        accessory: { type: 2, style: 2, custom_id: "btn_submodulo_farm", label: "Acessar", emoji: { name: "📦" } }
                    },

                    { type: 14, spacing: 1, divider: true },
                    {
                        type: 1, // Botão para voltar pro QG Principal
                        components: [
                            { type: 2, style: 4, custom_id: `btn_voltar_menu_principal_p${pagina}`, label: "Voltar ao QG", emoji: { name: "🔙" } }
                        ]
                    },
                    { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
                ]
            }
        ];

        try {
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: menuGestao } }
            });
        } catch (error) {
            console.error('[ERRO REST] Falha ao abrir menu de gestão:', error);
        }
    }
};
// src/commands/painel/kodafive.js
const { Routes } = require('discord.js');

module.exports = {
    name: 'kodafive',
    description: '[GESTÃO] Abre a central de controle da facção',
    async execute(interaction) {
        const isGestao = interaction.member?.permissions.has('Administrator');
        const isDev = interaction.user.id === process.env.DEV_ID;

        if (!isGestao && !isDev) {
            return interaction.reply({ 
                content: 'Sai pra lá, Zé Polvinho. Isso aqui é o QG do Patrão, acesso restrito.', 
                ephemeral: true 
            });
        }
        
        console.log(`[SISTEMA] O chefia ${interaction.user.tag} puxou o painel nativo /kodafive`);

        // JSON Bruto - Design Premium com Botões em Linha (Sections)
        const componentsV2 = [
            {
                type: 17, // Container principal
                accent_color: 16711680, 
                components: [
                    {
                        type: 12, // Banner
                        items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] // Troque pelo seu link
                    },
                    {
                        type: 10, // Cabeçalho
                        content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`"
                    },
                    { type: 14, spacing: 1, divider: true }, // Separador de linha fina
                    
                    // --- MÓDULO 1: GESTÃO ---
                    {
                        type: 9, // Section (Texto na esquerda, Botão na direita)
                        components: [
                            { type: 10, content: "### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar" }
                    },
                    
                    // --- MÓDULO 2: ARSENAL ---
                    {
                        type: 9,
                        components: [
                            { type: 10, content: "### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar" }
                    },
                    
                    // --- MÓDULO 3: TRIBUNAL ---
                    {
                        type: 9,
                        components: [
                            { type: 10, content: "### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar" }
                    },
                    
                    { type: 14, spacing: 1, divider: true }, // Outro separador antes dos controles

                    // --- CONTROLES DE PÁGINA E VIP ---
                    {
                        type: 1, // ActionRow normal
                        components: [
                            { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                            { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                            { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } }
                        ]
                    },
                    {
                        type: 1, 
                        components: [
                            { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                        ]
                    },
                    {
                        type: 10, // Rodapé
                        content: "*KODA STUDIOS | #Tropa • 25/07/2026*"
                    }
                ]
            }
        ];

        try {
            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 4, 
                        data: {
                            flags: 32832, // V2 + Ephemeral
                            components: componentsV2
                        }
                    }
                }
            );
        } catch (error) {
            console.error('[ERRO REST] Falha ao dropar o painel V2 Container:', error);
        }
    }
};
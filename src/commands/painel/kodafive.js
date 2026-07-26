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

        // JSON Bruto - Usando Container (type 17) para englobar tudo
        const componentsV2 = [
            {
                type: 17,
                accent_color: 16711680, // Vermelho em decimal
                components: [
                    {
                        type: 12, // MediaGallery para o Banner no topo
                        items: [
                            { media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } } // COLOQUE SEU LINK AQUI
                        ]
                    },
                    {
                        type: 10, // TextDisplay para o conteúdo
                        content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`\n\n### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH.\n\n### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2.\n\n### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP.\n\n*KODA STUDIOS | #Tropa • 25/07/2026*"
                    },
                    {
                        type: 1, // ActionRow dentro do Container (Botões em linha)
                        components: [
                            { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar Gestão", emoji: { name: "📋" } },
                            { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar Arsenal", emoji: { name: "🔫" } },
                            { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar Tribunal", emoji: { name: "⚖️" } }
                        ]
                    },
                    {
                        type: 1, // ActionRow de paginação
                        components: [
                            { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                            { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                            { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } },
                            { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                        ]
                    }
                ]
            }
        ];

        try {
            // Bypass REST para garantir que a renderização V2 (flags: 32768) seja forçada
            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 4, 
                        data: {
                            flags: 32832, // 32768 (V2) + 64 (Ephemeral)
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
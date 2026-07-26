// src/commands/painel/kodafive.js
const { Routes } = require('discord.js');

module.exports = {
    name: 'kodafive',
    description: '[GESTÃO] Abre a central de controle da facção',
    async execute(interaction) {
        // Trava de segurança (o '?' evita crash se usarem na DM)
        const isGestao = interaction.member?.permissions.has('Administrator');
        const isDev = interaction.user.id === process.env.DEV_ID;

        if (!isGestao && !isDev) {
            return interaction.reply({ 
                content: 'Sai pra lá, Zé Polvinho. Isso aqui é o QG do Patrão, acesso restrito.', 
                ephemeral: true 
            });
        }
        
        console.log(`[SISTEMA] O chefia ${interaction.user.tag} puxou o painel /kodafive`);

        // JSON Bruto V2 puro
        const componentsV2 = [
            {
                type: 10,
                content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`\n\n### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH.\n\n### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2.\n\n### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP."
            },
            {
                type: 1, 
                components: [
                    { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar Gestão", emoji: { name: "📋" } },
                    { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar Arsenal", emoji: { name: "🔫" } },
                    { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar Tribunal", emoji: { name: "⚖️" } }
                ]
            },
            {
                type: 1, 
                components: [
                    { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                    { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                    { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } },
                    { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                ]
            }
        ];

        try {
            // Bypass do discord.js - Enviando direto via REST
            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 4, // 4 = Responder com mensagem
                        data: {
                            flags: 32832, // 32768 (V2) + 64 (Ephemeral) = V2 Privado
                            components: componentsV2
                        }
                    }
                }
            );
        } catch (error) {
            console.error('[ERRO REST] Falha ao dropar o painel V2:', error);
        }
    }
};
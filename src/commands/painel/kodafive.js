// src/commands/painel/kodafive.js

module.exports = {
    name: 'kodafive',
    description: 'Abre a central de gestão',
    async execute(interaction) {
        
        // JSON Bruto usando Components V2
        const payload = {
            flags: 32768, // Ativa o modo IS_COMPONENTS_V2
            components: [
                {
                    type: 10, // Text Display Component
                    content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`\n\n### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH.\n\n### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2.\n\n### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP."
                },
                {
                    type: 1, // Action Row 1 (Módulos)
                    components: [
                        { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar Gestão", emoji: { name: "📋" } },
                        { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar Arsenal", emoji: { name: "🔫" } },
                        { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar Tribunal", emoji: { name: "⚖️" } }
                    ]
                },
                {
                    type: 1, // Action Row 2 (Paginação e VIP)
                    components: [
                        { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                        { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                        { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } },
                        { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                    ]
                }
            ]
        };

        await interaction.reply(payload);
    }
};
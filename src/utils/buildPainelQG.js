const { pool } = require('../database/db');

async function buildPainelQG(interaction) {
    const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const isVip = config.rows[0]?.is_vip || false;

    const statusTexto = isVip ? '`Plano Patrão (VIP) 💎`' : '`Plano Cria (Grátis)`';

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                { type: 12, items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] },
                { type: 10, content: `# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** ${statusTexto}` },
                { type: 14, spacing: 1, divider: true },

                {
                    type: 9,
                    components: [{ type: 10, content: "### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH." }],
                    accessory: { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar" }
                },
                {
                    type: 9,
                    components: [{ type: 10, content: "### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2." }],
                    accessory: { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar" }
                },
                {
                    type: 9,
                    components: [{ type: 10, content: "### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP." }],
                    accessory: { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar" }
                },
                {
                    type: 9,
                    components: [{ type: 10, content: "### 🏷️ Tags Automáticas\nTags automáticas no apelido baseado em cargo da facção." }],
                    accessory: { type: 2, style: 2, custom_id: "btn_modulo_tags", label: "Explorar" }
                },

                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
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
                { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelQG };

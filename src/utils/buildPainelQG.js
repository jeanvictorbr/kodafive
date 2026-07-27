const { pool } = require('../database/db');

async function buildPainelQG(interaction, pagina = 1) {
    const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const isVip = config.rows[0]?.is_vip || false;
    const statusTexto = isVip ? '`Plano Patrão (VIP) 💎`' : '`Plano Cria (Grátis)`';

    const baseComponents = [
        { type: 12, items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] },
        { type: 10, content: `# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** ${statusTexto}` },
        { type: 14, spacing: 1, divider: true }
    ];

    const modulesPagina1 = [
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
            components: [{ type: 10, content: "### 🏷️ Tags Automáticas\nTags automáticas no apelido baseado em cargo." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_tags", label: "Explorar" }
        }
    ];

    const modulesPagina2 = [
        {
            type: 9,
            components: [{ type: 10, content: "### 🤖 Auto-Resposta (FAQ)\nPalavras-chave com respostas automáticas nos canais." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_faq", label: "Explorar" }
        },
        {
            type: 9,
            components: [{ type: 10, content: "### 🤝 Alianças & Rivais\nGerencie e exiba as relações da facção." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_aliancas", label: "Explorar" }
        },
        {
            type: 9,
            components: [{ type: 10, content: "### 🚨 Alerta Geral\nDispare alertas via DM para toda a facção." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_sirene", label: "Explorar" }
        },
        {
            type: 9,
            components: [{ type: 10, content: "### 🧹 Expurgo Automático\nRemova cargos de membros inativos." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_expurgo", label: "Explorar" }
        }
    ];

    const modules = pagina === 1 ? modulesPagina1 : modulesPagina2;
    const pageLabel = `Página ${pagina}/2`;
    const isFirst = pagina === 1;
    const isLast = pagina === 2;

    const componentes = [
        ...baseComponents,
        ...modules,
        { type: 14, spacing: 1, divider: true },
        {
            type: 1,
            components: [
                { type: 2, style: 2, custom_id: isFirst ? "page_back_disabled" : "page_back", emoji: { name: "⬅️" }, disabled: isFirst },
                { type: 2, style: 2, custom_id: "page_indicator", label: pageLabel, disabled: true },
                { type: 2, style: 2, custom_id: isLast ? "page_next_disabled" : "page_next", emoji: { name: "➡️" }, disabled: isLast }
            ]
        },
        {
            type: 1,
            components: [
                { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } },
                { type: 2, style: 2, custom_id: "btn_exportar_backup", label: "Backup", emoji: { name: "📦" } },
                { type: 2, style: 2, custom_id: "btn_importar_backup", label: "Restore", emoji: { name: "📂" } }
            ]
        },
        { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
    ];

    return [{ type: 17, accent_color: 16711680, components: componentes }];
}

module.exports = { buildPainelQG };

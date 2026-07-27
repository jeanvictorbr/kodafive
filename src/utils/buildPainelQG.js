const { pool } = require('../database/db');

async function buildPainelQG(interaction, pagina = 1) {
    const config = await pool.query('SELECT is_vip, vip_expira_em FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const isVip = config.rows[0]?.is_vip || false;
    const vipExpira = config.rows[0]?.vip_expira_em;

    let statusTexto = isVip ? '`Plano Patrão (VIP) 💎`' : '`Plano Cria (Grátis)`';
    if (isVip && vipExpira) {
        const ts = Math.floor(new Date(vipExpira).getTime() / 1000);
        statusTexto += `\n> 📅 Expira <t:${ts}:R>`;
    } else if (isVip) {
        statusTexto += '\n> ♾️ Vitalício';
    }
    statusTexto += '\n> 💰 Para adquirir, entre em contato com a **KODA STUDIOS**';

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
            components: [{ type: 10, content: `### 🏷️ Tags Automáticas 💎\n\`[REQUER VIP]\` Tags automáticas no apelido baseado em cargo.` }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_tags", label: "Explorar", disabled: !isVip }
        }
    ];

    const modulesPagina2 = [
        {
            type: 9,
            components: [{ type: 10, content: `### 🤖 Auto-Resposta (FAQ) 💎\n\`[REQUER VIP]\` Palavras-chave com respostas automáticas.` }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_faq", label: "Explorar", disabled: !isVip }
        },
        {
            type: 9,
            components: [{ type: 10, content: `### 🤝 Alianças & Rivais 💎\n\`[REQUER VIP]\` Gerencie e exiba as relações da facção.` }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_aliancas", label: "Explorar", disabled: !isVip }
        },
        {
            type: 9,
            components: [{ type: 10, content: "### 🚨 Alerta Geral\nDispare alertas via DM para toda a facção." }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_sirene", label: "Explorar" }
        },
        {
            type: 9,
            components: [{ type: 10, content: `### 🧹 Expurgo Automático 💎\n\`[REQUER VIP]\` Remova cargos de membros inativos.` }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_expurgo", label: "Explorar", disabled: !isVip }
        },
        {
            type: 9,
            components: [{ type: 10, content: `### 💡 Sugestões 💎\n\`[REQUER VIP]\` Receba e gerencie sugestões da rapaziada.` }],
            accessory: { type: 2, style: 2, custom_id: "btn_modulo_sugestoes", label: "Explorar", disabled: !isVip }
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

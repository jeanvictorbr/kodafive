const { pool } = require('../database/db');

const MODULOS_PAG1 = [
    { nome: "### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH.", id: "btn_modulo_recrutamento", livre: true },
    { nome: "### 📋 Plantão\nControle de quem está de serviço na facção.", id: "btn_modulo_plantao", livre: true },
    { nome: "### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP.", id: "btn_modulo_tribunal", livre: true },
    { nome: "### 🏷️ Tags Automáticas 💎\n`[REQUER VIP]` Tags automáticas no apelido.", id: "btn_modulo_tags", vip: true }
];

const MODULOS_PAG2 = [
    { nome: "### 🤖 Auto-Resposta (FAQ) 💎\n`[REQUER VIP]` Palavras-chave com respostas.", id: "btn_modulo_faq", vip: true },
    { nome: "### 🤝 Alianças & Rivais 💎\n`[REQUER VIP]` Gerencie as relações da facção.", id: "btn_modulo_aliancas", vip: true },
    { nome: "### 🚨 Alerta Geral\nDispare alertas via DM para toda a facção.", id: "btn_modulo_sirene", livre: true },
    { nome: "### 🧹 Expurgo Automático 💎\n`[REQUER VIP]` Remova cargos de membros inativos.", id: "btn_modulo_expurgo", vip: true }
];

const MODULOS_PAG3 = [
    { nome: "### 💡 Sugestões 💎\n`[REQUER VIP]` Receba e gerencie sugestões.", id: "btn_modulo_sugestoes", vip: true }
];

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

    const paginas = [MODULOS_PAG1, MODULOS_PAG2, MODULOS_PAG3];
    const totalPaginas = paginas.length;
    const modulos = paginas[pagina - 1] || MODULOS_PAG1;

    const moduleComponents = modulos.map(m => ({
        type: 9,
        components: [{ type: 10, content: m.nome }],
        accessory: {
            type: 2, style: 2,
            custom_id: `${m.id}_p${pagina}`,
            label: m.disabled ? (m.label || 'Explorar') : 'Explorar',
            disabled: m.disabled || (m.vip && !isVip)
        }
    }));

    return [{
        type: 17,
        accent_color: 16711680,
        components: [
            { type: 12, items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] },
            { type: 10, content: `# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** ${statusTexto}` },
            { type: 14, spacing: 1, divider: true },
            ...moduleComponents,
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    { type: 2, style: 2, custom_id: pagina <= 1 ? "page_back_disabled" : `page_back_p${pagina - 1}`, emoji: { name: "⬅️" }, disabled: pagina <= 1 },
                    { type: 2, style: 2, custom_id: "page_indicator", label: `Página ${pagina}/${totalPaginas}`, disabled: true },
                    { type: 2, style: 2, custom_id: pagina >= totalPaginas ? "page_next_disabled" : `page_next_p${pagina + 1}`, emoji: { name: "➡️" }, disabled: pagina >= totalPaginas }
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
            { type: 10, content: "*💼 KODA STUDIOS • v0.0.1-beta • Sistema de Gestão Inteligente*" }
        ]
    }];
}

module.exports = { buildPainelQG };

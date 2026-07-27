const { pool } = require('../database/db');

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR');
}

async function buildPainelDev(client, pagina = 1, guildId = null) {
    if (guildId) return buildPainelDevServer(client, guildId);

    const totalGuilds = client.guilds.cache.size;
    const vips = (await pool.query('SELECT COUNT(*)::int as total FROM server_config WHERE is_vip = true')).rows[0].total;
    const keysTotal = (await pool.query('SELECT COUNT(*)::int as total FROM vip_keys')).rows[0].total;
    const keysUsadas = (await pool.query('SELECT COUNT(*)::int as total FROM vip_keys WHERE usada = true')).rows[0].total;
    const keysDisponiveis = keysTotal - keysUsadas;

    const porPagina = 10;
    const guilds = [...client.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);
    const totalPaginas = Math.ceil(guilds.length / porPagina) || 1;
    const inicio = (pagina - 1) * porPagina;
    const pageGuilds = guilds.slice(inicio, inicio + porPagina);

    const vipGuilds = (await pool.query('SELECT guild_id FROM server_config WHERE is_vip = true')).rows.map(r => r.guild_id);

    let listaServidores = '';
    for (const g of pageGuilds) {
        const isVip = vipGuilds.includes(g.id);
        listaServidores += `> ${isVip ? '💎' : '⬜'} **${g.name}** — ${g.memberCount} membros\n`;
    }
    if (!listaServidores) listaServidores = '> *Nenhum servidor encontrado.*';

    const avatarUrl = client.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [{
        type: 17,
        accent_color: 16711680,
        components: [
            {
                type: 9,
                components: [{ type: 10, content: "# 👑 CENTRAL DE CONTROLE\nPainel do desenvolvedor — gestão total do bot." }],
                accessory: { type: 11, media: { url: avatarUrl } }
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### 📊 Visão Geral\n> 🌐 Servidores: **${totalGuilds}**\n> 💎 VIPs: **${vips}**\n> 🔑 Keys: **${keysDisponiveis}** disponíveis / **${keysUsadas}** usadas`
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### 🌍 Servidores (pág ${pagina}/${totalPaginas})\n${listaServidores}`
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    { type: 2, style: 2, custom_id: "btn_dev_select_server", label: "🔍 Ver Servidor", emoji: { name: "🔍" } },
                    { type: 2, style: 2, custom_id: `btn_dev_pag_${pagina - 1}`, label: "⬅️", disabled: pagina <= 1 },
                    { type: 2, style: 2, custom_id: "page_indicator_dev", label: `${pagina}/${totalPaginas}`, disabled: true },
                    { type: 2, style: 2, custom_id: `btn_dev_pag_${pagina + 1}`, label: "➡️", disabled: pagina >= totalPaginas }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 3, custom_id: `btn_dev_vip_all_grant`, label: "💎 Liberar VIP p/ Todos", emoji: { name: "💎" } },
                    { type: 2, style: 4, custom_id: `btn_dev_vip_all_revoke`, label: "⛔ Remover VIP de Todos", emoji: { name: "⛔" } }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 2, custom_id: "btn_dev_keys", label: "🔑 Gerenciar Keys", emoji: { name: "🔑" } }
                ]
            },
            { type: 10, content: "*💼 KODA STUDIOS • Central de Controle*" }
        ]
    }];
}

async function buildPainelDevServer(client, guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return [{
            type: 17,
            accent_color: 16711680,
            components: [
                { type: 10, content: "# ❌ Servidor não encontrado\nO bot não está mais neste servidor." },
                { type: 1, components: [{ type: 2, style: 4, custom_id: "btn_dev_back", label: "Voltar", emoji: { name: "🔙" } }] }
            ]
        }];
    }

    const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [guildId]);
    const isVip = config.rows[0]?.is_vip || false;

    let ownerTag = 'Desconhecido';
    try {
        const owner = await guild.fetchOwner();
        ownerTag = owner.user.tag;
    } catch {}

    const avatarUrl = guild.iconURL({ extension: 'png', size: 256 }) || client.user.displayAvatarURL({ extension: 'png', size: 256 });

    const membros = (await pool.query('SELECT COUNT(*)::int as total FROM membros WHERE guild_id = $1', [guildId])).rows[0].total;
    const sugestoes = (await pool.query('SELECT COUNT(*)::int as total FROM sugestoes WHERE guild_id = $1', [guildId])).rows[0].total;

    return [{
        type: 17,
        accent_color: isVip ? 65280 : 16711680,
        components: [
            {
                type: 9,
                components: [{ type: 10, content: `# 🌍 ${guild.name}\n> 👑 Dono: **${ownerTag}**\n> 👥 Membros: **${guild.memberCount}**\n> 🆔 ID: \`${guild.id}\`` }],
                accessory: { type: 11, media: { url: avatarUrl } }
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### 📊 Informações\n> 💎 **VIP:** ${isVip ? '✅ Sim' : '❌ Não'}\n> 📋 Membros no banco: **${membros}**\n> 💡 Sugestões: **${sugestoes}**\n> 📅 Criado em: ${formatDate(guild.createdAt)}`
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    isVip
                        ? { type: 2, style: 4, custom_id: `btn_dev_vip_revoke_${guildId}`, label: "⛔ Remover VIP", emoji: { name: "⛔" } }
                        : { type: 2, style: 3, custom_id: `btn_dev_vip_grant_${guildId}`, label: "💎 Conceder VIP", emoji: { name: "💎" } }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 4, custom_id: "btn_dev_back", label: "🔙 Voltar", emoji: { name: "🔙" } }
                ]
            },
            { type: 10, content: "*💼 KODA STUDIOS • Central de Controle*" }
        ]
    }];
}

async function buildPainelDevKeys(client) {
    const keys = await pool.query(
        'SELECT * FROM vip_keys ORDER BY gerada_em DESC LIMIT 20'
    );

    let listaKeys = '';
    for (const k of keys.rows) {
        const status = k.usada ? `✅ Usada` : '⬜ Disponível';
        const data = formatDate(k.gerada_em);
        listaKeys += `> \`${k.key}\` — ${status} — ${data}\n`;
    }
    if (!listaKeys) listaKeys = '> *Nenhuma key cadastrada.*';

    const stats = (await pool.query(
        'SELECT COUNT(*)::int as total, SUM(CASE WHEN usada THEN 1 ELSE 0 END)::int as usadas FROM vip_keys'
    )).rows[0];

    return [{
        type: 17,
        accent_color: 16753920,
        components: [
            { type: 10, content: "# 🔑 GERENCIAR KEYS VIP\nGerencie as chaves de ativação do plano VIP." },
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### 📊 Estatísticas\n> 🔑 Total: **${stats.total}**\n> ✅ Usadas: **${stats.usadas}**\n> ⬜ Disponíveis: **${stats.total - stats.usadas}**`
            },
            { type: 14, spacing: 1, divider: true },
            { type: 10, content: `### 📋 Últimas Keys\n${listaKeys}` },
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    { type: 2, style: 3, custom_id: "btn_dev_genkey", label: "Gerar Key", emoji: { name: "➕" } },
                    { type: 2, style: 3, custom_id: "btn_dev_genkeys_mass", label: "Gerar em Massa", emoji: { name: "📦" } }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 4, custom_id: "btn_dev_back", label: "🔙 Voltar", emoji: { name: "🔙" } }
                ]
            },
            { type: 10, content: "*💼 KODA STUDIOS • Central de Controle*" }
        ]
    }];
}

module.exports = { buildPainelDev, buildPainelDevKeys };

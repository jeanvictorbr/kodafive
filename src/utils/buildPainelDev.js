const { pool } = require('../database/db');

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR');
}

function formatUptime(segundos) {
    const d = Math.floor(segundos / 86400);
    const h = Math.floor((segundos % 86400) / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = Math.floor(segundos % 60);
    const partes = [];
    if (d > 0) partes.push(`${d}d`);
    if (h > 0) partes.push(`${h}h`);
    if (m > 0) partes.push(`${m}m`);
    partes.push(`${s}s`);
    return partes.join(' ');
}

function origemLabel(origem) {
    if (origem === 'doacao') return '🎁 Doação';
    if (origem === 'manual') return '🛠️ Manual';
    if (origem === 'key') return '🔑 Key';
    return '❓ Desconhecida';
}

async function buildPainelDev(client, pagina = 1, guildId = null) {
    client.startTime = client.startTime || Date.now();

    if (guildId) return buildPainelDevServer(client, guildId);

    const totalGuilds = client.guilds.cache.size;
    const vips = (await pool.query('SELECT COUNT(*)::int as total FROM server_config WHERE is_vip = true')).rows[0].total;
    const vipsDoados = (await pool.query("SELECT COUNT(*)::int as total FROM server_config WHERE is_vip = true AND vip_origem = 'doacao'")).rows[0].total;
    const keysTotal = (await pool.query('SELECT COUNT(*)::int as total FROM vip_keys')).rows[0].total;
    const keysUsadas = (await pool.query('SELECT COUNT(*)::int as total FROM vip_keys WHERE usos_atual >= usos_max')).rows[0].total;
    const keysDisponiveis = keysTotal - keysUsadas;

    const keysAtivadasHoje = (await pool.query(
        "SELECT COUNT(*)::int as total FROM vip_keys WHERE usos_atual > 0 AND gerada_em::date = CURRENT_DATE"
    )).rows[0].total;

    const uptime = formatUptime(process.uptime());

    const porPagina = 10;
    const guilds = [...client.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);
    const totalPaginas = Math.ceil(guilds.length / porPagina) || 1;
    const inicio = (pagina - 1) * porPagina;
    const pageGuilds = guilds.slice(inicio, inicio + porPagina);

    const vipData = (await pool.query('SELECT guild_id, vip_expira_em, vip_origem FROM server_config WHERE is_vip = true')).rows;
    const vipMap = {};
    const origemMap = {};
    for (const v of vipData) {
        vipMap[v.guild_id] = v.vip_expira_em;
        origemMap[v.guild_id] = v.vip_origem;
    }

    let listaServidores = '';
    for (const g of pageGuilds) {
        const isVip = g.id in vipMap;
        const expira = vipMap[g.id];
        const origem = origemMap[g.id];
        let expiraTexto = '';
        if (isVip && expira) {
            const ts = Math.floor(new Date(expira).getTime() / 1000);
            expiraTexto = ` — expira <t:${ts}:R>`;
        }
        const badge = isVip ? origemLabel(origem) : '⬜';
        listaServidores += `> ${badge} **${g.name}** — ${g.memberCount} membros${expiraTexto}\n`;
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
                content: `### 📊 Visão Geral\n> 🌐 Servidores: **${totalGuilds}** • 💎 VIPs: **${vips}** (🔑 ${vips - vipsDoados} key + 🎁 ${vipsDoados} doação)\n> 🔑 Keys: **${keysDisponiveis}** disponíveis / **${keysUsadas}** esgotadas\n> 📈 Ativações hoje: **${keysAtivadasHoje}** • ⏱ Uptime: **${uptime}**`
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
                    { type: 2, style: 2, custom_id: "btn_dev_refresh", label: "🔄 Atualizar", emoji: { name: "🔄" } },
                    { type: 2, style: 2, custom_id: `btn_dev_pag_${pagina - 1}`, label: "⬅️", disabled: pagina <= 1 },
                    { type: 2, style: 2, custom_id: "page_indicator_dev", label: `${pagina}/${totalPaginas}`, disabled: true },
                    { type: 2, style: 2, custom_id: `btn_dev_pag_${pagina + 1}`, label: "➡️", disabled: pagina >= totalPaginas }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 3, custom_id: "btn_dev_vip_all_grant", label: "💎 Liberar VIP p/ Todos", emoji: { name: "💎" } },
                    { type: 2, style: 4, custom_id: "btn_dev_vip_all_revoke", label: "⛔ Remover VIP de Todos", emoji: { name: "⛔" } }
                ]
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 2, custom_id: "btn_dev_doar_vip", label: "🎁 Doar VIP", emoji: { name: "🎁" } },
                    { type: 2, style: 4, custom_id: "btn_dev_remover_doados", label: "⛔ Remover VIPs Doados", emoji: { name: "⛔" } }
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
            type: 17, accent_color: 16711680,
            components: [
                { type: 10, content: "# ❌ Servidor não encontrado\nO bot não está mais neste servidor." },
                { type: 1, components: [{ type: 2, style: 4, custom_id: "btn_dev_back", label: "Voltar", emoji: { name: "🔙" } }] }
            ]
        }];
    }

    const config = (await pool.query('SELECT is_vip, vip_expira_em, vip_origem, vip_doado_por, vip_doado_em FROM server_config WHERE guild_id = $1', [guildId])).rows[0] || {};
    const isVip = config.is_vip || false;
    const vipExpira = config.vip_expira_em;
    const vipOrigem = config.vip_origem || 'key';
    const vipDoadoPor = config.vip_doado_por;
    const vipDoadoEm = config.vip_doado_em;

    let ownerTag = 'Desconhecido';
    try {
        const owner = await guild.fetchOwner();
        ownerTag = owner.user.tag;
    } catch {}

    const avatarUrl = guild.iconURL({ extension: 'png', size: 256 }) || client.user.displayAvatarURL({ extension: 'png', size: 256 });

    const membros = (await pool.query('SELECT COUNT(*)::int as total FROM membros WHERE guild_id = $1', [guildId])).rows[0].total;
    const sugestoes = (await pool.query('SELECT COUNT(*)::int as total FROM sugestoes WHERE guild_id = $1', [guildId])).rows[0].total;
    const fichas = (await pool.query('SELECT COUNT(*)::int as total FROM recrutamento WHERE guild_id = $1', [guildId])).rows[0].total;
    const autoRespostas = (await pool.query('SELECT COUNT(*)::int as total FROM auto_resposta WHERE guild_id = $1', [guildId])).rows[0].total;
    const tags = (await pool.query('SELECT COUNT(*)::int as total FROM cargo_tags WHERE guild_id = $1', [guildId])).rows[0].total;
    const aliancas = (await pool.query('SELECT COUNT(*)::int as total FROM aliancas WHERE guild_id = $1', [guildId])).rows[0].total;
    const plantaoAtivo = (await pool.query("SELECT COUNT(*)::int as total FROM plantao WHERE guild_id = $1 AND status = 'ativo'", [guildId])).rows[0].total;
    const lembreteConfig = (await pool.query('SELECT ativo, dias_sem_ponto FROM config_lembrete WHERE guild_id = $1', [guildId])).rows[0];

    let vipTexto = isVip ? `${origemLabel(vipOrigem)}` : '❌ Não';
    if (isVip && vipExpira) {
        vipTexto += ` — expira <t:${Math.floor(new Date(vipExpira).getTime() / 1000)}:R>`;
    }
    if (isVip && vipOrigem === 'doacao' && vipDoadoPor) {
        vipTexto += `\n> 🎁 Doado por: <@${vipDoadoPor}>`;
        if (vipDoadoEm) {
            vipTexto += ` em ${formatDate(vipDoadoEm)}`;
        }
    }

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
                content: `### 📊 Informações\n> 💎 **VIP:** ${vipTexto}\n> 📋 Membros no banco: **${membros}**\n> 📝 Fichas: **${fichas}** • 💡 Sugestões: **${sugestoes}**\n> 🤖 Auto-respostas: **${autoRespostas}** • 🏷️ Tags: **${tags}**\n> 🤝 Alianças: **${aliancas}**\n> 📋 Plantão ativo: **${plantaoAtivo}**\n> ⏰ Lembretes: ${lembreteConfig?.ativo ? '✅ Sim (' + lembreteConfig.dias_sem_ponto + 'd sem ponto)' : '❌ Desligado'}\n> 📅 Criado em: ${formatDate(guild.createdAt)}`
            },
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: (() => {
                    const btns = [];
                    if (isVip && vipOrigem === 'doacao') {
                        btns.push({ type: 2, style: 4, custom_id: `btn_dev_vip_revoke_${guildId}`, label: "⛔ Remover Doação", emoji: { name: "⛔" } });
                    } else if (isVip) {
                        btns.push({ type: 2, style: 4, custom_id: `btn_dev_vip_revoke_${guildId}`, label: "⛔ Remover VIP", emoji: { name: "⛔" } });
                    } else {
                        btns.push({ type: 2, style: 3, custom_id: `btn_dev_vip_grant_${guildId}`, label: "💎 Conceder VIP", emoji: { name: "💎" } });
                    }
                    btns.push({ type: 2, style: 2, custom_id: "btn_dev_doar_vip", label: "🎁 Doar VIP", emoji: { name: "🎁" } });
                    return btns;
                })()
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

    const stats = (await pool.query(
        "SELECT COUNT(*)::int as total, SUM(CASE WHEN usos_atual >= usos_max THEN 1 ELSE 0 END)::int as usadas FROM vip_keys"
    )).rows[0];

    const ativadasHoje = (await pool.query(
        "SELECT COUNT(*)::int as total FROM vip_keys WHERE usos_atual > 0 AND gerada_em::date = CURRENT_DATE"
    )).rows[0].total;

    const ativadasTotal = (await pool.query(
        "SELECT COUNT(*)::int as total FROM vip_keys WHERE usos_atual > 0"
    )).rows[0].total;

    let listaKeys = '';
    for (const k of keys.rows) {
        const usos = `${k.usos_atual}/${k.usos_max}`;
        const duracao = k.dias_validade > 0 ? `${k.dias_validade}d` : '∞';
        const status = k.usos_atual >= k.usos_max ? '🔴 Esgotada' : '🟢 Disponível';
        const data = formatDate(k.gerada_em);
        listaKeys += `> \`${k.key}\` — ${status} — ${duracao} — usos: ${usos} — ${data}\n`;
    }
    if (!listaKeys) listaKeys = '> *Nenhuma key cadastrada.*';

    return [{
        type: 17,
        accent_color: 16753920,
        components: [
            { type: 10, content: "# 🔑 GERENCIAR KEYS VIP\nGerencie as chaves de ativação do plano VIP." },
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### 📊 Estatísticas\n> 🔑 Total: **${stats.total}**\n> 🟢 Disponíveis: **${stats.total - stats.usadas}**\n> 🔴 Esgotadas: **${stats.usadas}**\n> 📈 Ativações hoje: **${ativadasHoje}** • Total: **${ativadasTotal}**`
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
                    { type: 2, style: 2, custom_id: "btn_dev_back_keys", label: "🔙 Voltar ao Painel", emoji: { name: "🔙" } }
                ]
            },
            { type: 10, content: "*💼 KODA STUDIOS • Central de Controle*" }
        ]
    }];
}

module.exports = { buildPainelDev, buildPainelDevKeys };

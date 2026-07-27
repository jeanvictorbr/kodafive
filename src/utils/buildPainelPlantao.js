const { pool } = require('../database/db');

async function buildPainelPlantao(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const cfg = await pool.query(
        'SELECT canal_plantao_id, plantao_banner, plantao_desc, plantao_msg_id, plantao_msg_canal_id, cargo_plantao_id FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const r = cfg.rows[0] || {};
    const canalPlantaoId = r.canal_plantao_id || null;
    const cargoPlantaoId = r.cargo_plantao_id || null;
    const banner = r.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = r.plantao_desc || 'Organize a escala de serviço da liderança. Garanta que sempre haja um responsável online.';
    const msgId = r.plantao_msg_id;
    const msgCanalId = r.plantao_msg_canal_id;

    const ativos = await pool.query(
        "SELECT user_id, cargo, inicio FROM plantao WHERE guild_id = $1 AND status = 'ativo' ORDER BY inicio ASC",
        [guildId]
    );

    let listaAtivos = '';
    for (const p of ativos.rows) {
        const inicioTs = Math.floor(new Date(p.inicio).getTime() / 1000);
        const badge = p.user_id === userId ? ' **← VOCÊ**' : '';
        listaAtivos += `> **${p.cargo}** — <@${p.user_id}> desde <t:${inicioTs}:R>${badge}\n`;
    }
    if (!listaAtivos) listaAtivos = '> *Ninguém no momento.*';

    const meuPlantao = ativos.rows.find(p => p.user_id === userId);
    const isAdmin = interaction.member?.permissions?.has('Administrator') || interaction.user.id === process.env.DEV_ID;

    const temPermissao = isAdmin || (cargoPlantaoId && interaction.member?.roles?.cache?.has(cargoPlantaoId));

    const canaisTexto = interaction.guild?.channels?.cache
        .filter(c => c.type === 0)
        .map(c => ({ label: `#${c.name}`, value: c.id }))
        .slice(0, 25) || [];

    function labelCargo(cargo) {
        const map = { 'Liderança': '🏛️', 'Recrutador': '📋', 'Gerente': '⚖️', 'Suporte': '🎯' };
        return `${map[cargo] || '📌'} ${cargo}`;
    }

    const escopo = cargoPlantaoId ? `<@&${cargoPlantaoId}>` : 'Liderança/Recrutadores';

    const desc = `> 🎯 **Público:** ${escopo}\n> 📌 **Diferença do Ponto:** Plantão é escala de serviço (quem cobre o quê). Ponto é registro individual de presença.\n${descricao}`;

    const components = [
        { type: 12, items: [{ media: { url: banner } }] },
        { type: 10, content: `# 📋 Plantão — Escala de Serviço\n${desc}` },
        { type: 14, spacing: 1, divider: true },
        {
            type: 10,
            content: `### 🟢 Cobertura Agora (${ativos.rows.length})\n${listaAtivos}`
        },
    ];

    if (meuPlantao) {
        const inicioTs = Math.floor(new Date(meuPlantao.inicio).getTime() / 1000);
        components.push(
            { type: 10, content: `### 👤 Seu Plantão\n> ${labelCargo(meuPlantao.cargo)} desde <t:${inicioTs}:F>` },
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    { type: 2, style: 4, custom_id: "btn_plantao_finalizar", label: "🔴 Encerrar Plantão", emoji: { name: "🔴" } }
                ]
            }
        );
    } else if (temPermissao) {
        components.push(
            { type: 14, spacing: 1, divider: true },
            {
                type: 1,
                components: [
                    { type: 2, style: 3, custom_id: "btn_plantao_iniciar", label: "✅ Assumir Plantão", emoji: { name: "✅" } }
                ]
            }
        );
    }

    if (isAdmin) {
        const publicado = msgId && msgCanalId ? `✅ <#${msgCanalId}>` : '❌ Não publicado';

        components.push(
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### ⚙️ Config\n> 📢 Log: ${canalPlantaoId ? `<#${canalPlantaoId}>` : '*não config*'} | 📋 Painel: ${publicado}`
            }
        );

        if (canaisTexto.length > 0) {
            components.push({
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "config_select_canal_plantao",
                    placeholder: "Canal do painel público",
                    options: canaisTexto
                }]
            });
        }

        const btns = [
            { type: 2, style: 2, custom_id: "btn_plantao_config_banner", label: "🖼 Banner", emoji: { name: "🖼" } },
            { type: 2, style: 2, custom_id: "btn_plantao_config_desc", label: "📝 Descrição", emoji: { name: "📝" } }
        ];
        if (canalPlantaoId) {
            btns.push({ type: 2, style: 3, custom_id: "btn_plantao_publicar", label: "📢 Publicar Painel", emoji: { name: "📢" } });
            if (msgId) btns.push({ type: 2, style: 2, custom_id: "btn_plantao_atualizar", label: "🔄 Atualizar", emoji: { name: "🔄" } });
        }
        components.push({ type: 1, components: btns });
    }

    components.push(
        { type: 14, spacing: 1, divider: true },
        { type: 1, components: [{ type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "🔙 Voltar ao QG", emoji: { name: "🔙" } }] },
        { type: 10, content: "*📋 KODA STUDIOS • Plantão (Escala de Serviço)*" }
    );

    return [{ type: 17, accent_color: 3447003, components }];
}

module.exports = { buildPainelPlantao };

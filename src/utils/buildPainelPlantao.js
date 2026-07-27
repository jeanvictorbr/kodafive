const { pool } = require('../database/db');

async function buildPainelPlantao(interaction, pagina = 1) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const cfg = await pool.query(
        'SELECT canal_plantao_id, plantao_banner, plantao_desc, plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const r = cfg.rows[0] || {};
    const canalPlantaoId = r.canal_plantao_id || null;
    const banner = r.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = r.plantao_desc || 'Controle quem está de serviço na facção.';
    const msgId = r.plantao_msg_id;
    const msgCanalId = r.plantao_msg_canal_id;

    const ativos = await pool.query(
        "SELECT user_id, inicio FROM plantao WHERE guild_id = $1 AND status = 'ativo' ORDER BY inicio ASC",
        [guildId]
    );

    let listaAtivos = '';
    for (const p of ativos.rows) {
        const inicioTs = Math.floor(new Date(p.inicio).getTime() / 1000);
        const badge = p.user_id === userId ? '**🔵 VOCÊ**' : '';
        listaAtivos += `> <@${p.user_id}> — desde <t:${inicioTs}:R> ${badge}\n`;
    }
    if (!listaAtivos) listaAtivos = '> *Ninguém no momento.*';

    const isAdmin = interaction.member?.permissions?.has('Administrator') || interaction.user.id === process.env.DEV_ID;

    const canaisTexto = interaction.guild?.channels?.cache
        .filter(c => c.type === 0)
        .map(c => ({ label: `#${c.name}`, value: c.id }))
        .slice(0, 25) || [];

    const components = [
        { type: 12, items: [{ media: { url: banner } }] },
        { type: 10, content: `# 📋 Plantão\n${descricao}` },
        { type: 14, spacing: 1, divider: true },
        {
            type: 10,
            content: `### 🟢 Em Serviço (${ativos.rows.length})\n${listaAtivos}`
        },
        { type: 14, spacing: 1, divider: true },
        {
            type: 1,
            components: [
                { type: 2, style: 3, custom_id: `btn_plantao_iniciar_p${pagina}`, label: "✅ Iniciar Plantão", emoji: { name: "✅" } },
                { type: 2, style: 4, custom_id: `btn_plantao_finalizar_p${pagina}`, label: "🔴 Finalizar Plantão", emoji: { name: "🔴" } }
            ]
        },
    ];

    if (isAdmin) {
        const publicado = msgId && msgCanalId ? `✅ Publicado em <#${msgCanalId}>` : '❌ Não publicado';

        components.push(
            { type: 14, spacing: 1, divider: true },
            {
                type: 10,
                content: `### ⚙️ Administração\n> 📢 Canal de log: ${canalPlantaoId ? `<#${canalPlantaoId}>` : '*Não configurado*'}\n> 📋 Painel: ${publicado}`
            }
        );

        if (canaisTexto.length > 0) {
            components.push({
                type: 1,
                components: [{
                    type: 3,
                    custom_id: `config_select_canal_plantao_p${pagina}`,
                    placeholder: "Selecionar canal de log",
                    options: canaisTexto
                }]
            });
        }

        const btnsConfig = [
            { type: 2, style: 2, custom_id: `btn_plantao_config_banner_p${pagina}`, label: "🖼 Banner", emoji: { name: "🖼" } },
            { type: 2, style: 2, custom_id: `btn_plantao_config_desc_p${pagina}`, label: "📝 Descrição", emoji: { name: "📝" } }
        ];

        if (canalPlantaoId) {
            btnsConfig.push({ type: 2, style: 3, custom_id: `btn_plantao_publicar_p${pagina}`, label: "📢 Publicar", emoji: { name: "📢" } });
            if (msgId) {
                btnsConfig.push({ type: 2, style: 2, custom_id: `btn_plantao_atualizar_p${pagina}`, label: "🔄 Atualizar", emoji: { name: "🔄" } });
            }
        }

        components.push({ type: 1, components: btnsConfig });
    }

    components.push(
        { type: 14, spacing: 1, divider: true },
        {
            type: 1,
            components: [
                { type: 2, style: 4, custom_id: `btn_voltar_menu_principal_p${pagina}`, label: "🔙 Voltar ao QG", emoji: { name: "🔙" } }
            ]
        },
        { type: 10, content: "*📋 KODA STUDIOS • Sistema de Plantão*" }
    );

    return [{ type: 17, accent_color: 3447003, components }];
}

module.exports = { buildPainelPlantao };

const { pool } = require('../database/db');

async function buildPainelPlantao(interaction) {
    const guildId = interaction.guildId;

    const cfg = await pool.query(
        'SELECT canal_plantao_id, plantao_banner, plantao_desc, plantao_msg_id, plantao_msg_canal_id, cargo_plantao_id FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const r = cfg.rows[0] || {};
    const canalPlantaoId = r.canal_plantao_id || null;
    const cargoPlantaoId = r.cargo_plantao_id || null;
    const banner = r.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = r.plantao_desc || 'Organiza a escala de serviço da liderança.';
    const msgId = r.plantao_msg_id;
    const msgCanalId = r.plantao_msg_canal_id;

    const isAdmin = interaction.member?.permissions?.has('Administrator') || interaction.user.id === process.env.DEV_ID;
    if (!isAdmin) {
        return [{ type: 17, accent_color: 15548997, components: [
            { type: 10, content: '# ⛔ Só o ADM pode mexer aqui\nTu não tem permissão pra configurar a escala de serviço.' },
            { type: 14, spacing: 1, divider: true },
            { type: 1, components: [{ type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "🔙 Voltar", emoji: { name: "🔙" } }] },
        ]}];
    }

    const canaisTexto = interaction.guild?.channels?.cache
        .filter(c => c.type === 0)
        .map(c => ({ label: `#${c.name}`, value: c.id }))
        .slice(0, 25) || [];

    const publicado = msgId && msgCanalId ? `✅ <#${msgCanalId}>` : '❌ Nunca publicado';

    const btns = [
        { type: 2, style: 2, custom_id: "btn_plantao_config_banner", label: "🖼 Banner", emoji: { name: "🖼" } },
        { type: 2, style: 2, custom_id: "btn_plantao_config_desc", label: "📝 Descrição", emoji: { name: "📝" } },
    ];

    const publicarBtns = [];
    if (canalPlantaoId) {
        publicarBtns.push(
            { type: 2, style: 3, custom_id: "btn_plantao_publicar", label: "📢 Publicar Painel", emoji: { name: "📢" } }
        );
        if (msgId) {
            publicarBtns.push(
                { type: 2, style: 2, custom_id: "btn_plantao_atualizar", label: "🔄 Atualizar", emoji: { name: "🔄" } }
            );
        }
    }

    const components = [
        { type: 12, items: [{ media: { url: banner } }] },
        { type: 10, content: `# ⚙️ Config da Escala de Serviço\n${descricao}` },
        { type: 14, spacing: 1, divider: true },
        {
            type: 10,
            content: `📢 **Canal do painel:** ${canalPlantaoId ? `<#${canalPlantaoId}>` : '*não config*'}\n📋 **Status:** ${publicado}\n🎯 **Cargo permitido:** ${cargoPlantaoId ? `<@&${cargoPlantaoId}>` : '*qualquer um*'}`
        },
    ];

    if (canaisTexto.length > 0) {
        components.push({
            type: 1,
            components: [{
                type: 3,
                custom_id: "config_select_canal_plantao",
                placeholder: "Canal pra publicar o painel",
                options: canaisTexto
            }]
        });
    }

    if (btns.length > 0) components.push({ type: 1, components: btns });
    if (publicarBtns.length > 0) components.push({ type: 1, components: publicarBtns });

    components.push(
        { type: 14, spacing: 1, divider: true },
        { type: 1, components: [{ type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "🔙 Voltar ao QG", emoji: { name: "🔙" } }] },
        { type: 10, content: "*📋 KODA STUDIOS • Escala de Serviço*" }
    );

    return [{ type: 17, accent_color: 3447003, components }];
}

module.exports = { buildPainelPlantao };

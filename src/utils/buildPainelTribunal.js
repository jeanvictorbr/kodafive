const { pool } = require('../database/db');
const { totalPorTipo } = require('./condutaHelper');

async function buildPainelTribunal(interaction) {
    const guildId = interaction.guildId;

    const [totalMultas, totalAdvertencias, totalSuspensoes] = await Promise.all([
        totalPorTipo(guildId, 'multa'),
        totalPorTipo(guildId, 'advertencia'),
        totalPorTipo(guildId, 'suspensao', true)
    ]);

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 15548997,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# ⚖️ TRIBUNAL DO CRIME\nSistema de conduta e disciplina da facção." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📊 Status da Disciplina\n> **Multas Aplicadas:** \`${totalMultas}\`\n> **Advertências:** \`${totalAdvertencias}\`\n> **Suspensões Ativas:** \`${totalSuspensoes}\``
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_tribunal_multa", label: "Aplicar Multa", emoji: { name: "💰" } },
                        { type: 2, style: 2, custom_id: "btn_tribunal_advertencia", label: "Advertência", emoji: { name: "📋" } },
                        { type: 2, style: 4, custom_id: "btn_tribunal_suspensao", label: "Suspender", emoji: { name: "🔒" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, custom_id: "btn_ver_dossie", label: "Dossiê do Membro", emoji: { name: "📄" } },
                        { type: 2, style: 3, custom_id: "btn_tribunal_ranking", label: "Ranking de Conduta", emoji: { name: "🏆" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelTribunal };

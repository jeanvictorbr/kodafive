const { pool } = require('../database/db');
const { calcularNivel, xpParaProximoNivel } = require('./xpHelper');

const XP_POR_NIVEL = 100;

function barraProgresso(atual, maximo, tamanho = 10) {
    const pct = Math.min(atual / maximo, 1);
    const cheios = Math.floor(pct * tamanho);
    return '█'.repeat(cheios) + '░'.repeat(tamanho - cheios);
}

async function buildPainelXP(interaction) {
    const guildId = interaction.guildId;

    const [ranking, stats, meuProgresso] = await Promise.all([
        pool.query(`
            SELECT user_id, xp, nivel FROM membros
            WHERE guild_id = $1
            ORDER BY xp DESC
            LIMIT 15
        `, [guildId]),
        pool.query(`
            SELECT COUNT(*) as total_membros, COALESCE(SUM(xp), 0) as total_xp,
                   COALESCE(AVG(nivel), 0) as media_nivel,
                   COALESCE(MAX(nivel), 0) as max_nivel,
                   COALESCE(MAX(xp), 0) as max_xp
            FROM membros WHERE guild_id = $1
        `, [guildId]),
        pool.query('SELECT xp, nivel FROM membros WHERE guild_id = $1 AND user_id = $2', [guildId, interaction.user.id])
    ]);

    const totalMembros = parseInt(stats.rows[0]?.total_membros) || 0;
    const totalXP = parseInt(stats.rows[0]?.total_xp) || 0;
    const mediaNivel = parseFloat(stats.rows[0]?.media_nivel) || 0;
    const maxNivel = parseInt(stats.rows[0]?.max_nivel) || 1;
    const maxXP = parseInt(stats.rows[0]?.max_xp) || 0;

    const meu = meuProgresso.rows[0] || { xp: 0, nivel: 1 };
    const xpNoNivel = meu.xp % XP_POR_NIVEL;
    const xpRestante = XP_POR_NIVEL - xpNoNivel;

    let rankingText = '';
    if (ranking.rows.length === 0) {
        rankingText = '> *Nenhum membro com XP registrado ainda.*';
    } else {
        ranking.rows.forEach((row, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `\`${i + 1}º\``;
            const bar = barraProgresso(row.xp % XP_POR_NIVEL, XP_POR_NIVEL, 8);
            rankingText += `> ${medal} <@${row.user_id}> — LV **${row.nivel}** ${bar} \`${row.xp} XP\`\n`;
        });
    }

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 16753920,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# ⭐ DASHBOARD: XP & NÍVEIS\nAcompanhe a evolução da tropa em tempo real." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },

                {
                    type: 10,
                    content: `### 📊 Visão Geral da Facção\n> 🏢 **Membros ativos:** \`${totalMembros}\`\n> ⭐ **XP Total:** \`${totalXP.toLocaleString()} XP\`\n> 📈 **Média de Nível:** \`${mediaNivel.toFixed(1)}\`\n> 🏆 **Maior Nível:** \`${maxNivel}\` (${maxXP.toLocaleString()} XP)`
                },
                { type: 14, spacing: 1, divider: true },

                {
                    type: 10,
                    content: `### 👤 Meu Progresso\n> **Nível Atual:** \`${meu.nivel}\`\n> **XP:** \`${meu.xp.toLocaleString()} XP\`\n\n${barraProgresso(xpNoNivel, XP_POR_NIVEL)} \`${xpNoNivel}/${XP_POR_NIVEL}\` (**${Math.round((xpNoNivel / XP_POR_NIVEL) * 100)}%**)\n> ⏳ Faltam \`${xpRestante} XP\` para o nível **${meu.nivel + 1}**`
                },
                { type: 14, spacing: 1, divider: true },

                {
                    type: 10,
                    content: `### 🏆 Ranking da Facção (Top 15)\n${rankingText}`
                },
                { type: 14, spacing: 1, divider: true },

                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_modulo_tribunal", label: "Voltar ao Tribunal", emoji: { name: "🔙" } }
                    ]
                },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelXP };

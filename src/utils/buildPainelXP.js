const { pool } = require('../database/db');
const { calcularNivel, xpParaProximoNivel } = require('./xpHelper');

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
            SELECT COUNT(*) as total_membros, COALESCE(SUM(xp), 0) as total_xp, COALESCE(AVG(nivel), 0) as media_nivel
            FROM membros WHERE guild_id = $1
        `, [guildId]),
        pool.query('SELECT xp, nivel FROM membros WHERE guild_id = $1 AND user_id = $2', [guildId, interaction.user.id])
    ]);

    const totalMembros = parseInt(stats.rows[0]?.total_membros) || 0;
    const totalXP = parseInt(stats.rows[0]?.total_xp) || 0;
    const mediaNivel = parseFloat(stats.rows[0]?.media_nivel) || 0;

    const meu = meuProgresso.rows[0] || { xp: 0, nivel: 1 };
    const xpRestante = xpParaProximoNivel(meu.xp);

    let rankingText = '';
    if (ranking.rows.length === 0) {
        rankingText = '> *Nenhum membro com XP registrado ainda.*';
    } else {
        ranking.rows.forEach((row, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `\`${i + 1}º\``;
            rankingText += `> ${medal} <@${row.user_id}> — Nível **${row.nivel}** — \`${row.xp} XP\`\n`;
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
                        { type: 10, content: "# ⭐ XP & NÍVEIS\nSistema de evolução por atividade na facção." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📊 Estatísticas Gerais\n> **Membros na base:** \`${totalMembros}\`\n> **XP Total da Facção:** \`${totalXP} XP\`\n> **Média de Nível:** \`${mediaNivel.toFixed(1)}\``
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 👤 Seu Progresso\n> **Nível:** \`${meu.nivel}\`\n> **XP:** \`${meu.xp}\`\n> **Próximo nível:** \`${xpRestante} XP restante\``
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

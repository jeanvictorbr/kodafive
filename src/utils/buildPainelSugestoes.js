const { pool } = require('../database/db');

async function buildPainelSugestoes(interaction) {
    const config = (await pool.query(
        'SELECT * FROM config_sugestao WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0];

    const canalAnalise = config?.canal_analise_id
        ? `<#${config.canal_analise_id}>`
        : '*Nenhum canal configurado*';

    const stats = (await pool.query(
        'SELECT status, COUNT(*)::int as total FROM sugestoes WHERE guild_id = $1 GROUP BY status',
        [interaction.guildId]
    )).rows;

    const pendentes = stats.find(s => s.status === 'pendente')?.total || 0;
    const aprovadas = stats.find(s => s.status === 'aprovada')?.total || 0;
    const recusadas = stats.find(s => s.status === 'recusada')?.total || 0;
    const analise = stats.find(s => s.status === 'analise')?.total || 0;

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 💡 SUGESTÕES\nReceba ideias e opiniões da rapaziada sobre a facção." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📋 Configuração\n> **Canal de Análise:** ${canalAnalise}\n> As sugestões são enviadas neste canal para votação da galera.`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📊 Estatísticas\n> 💬 Pendentes: **${pendentes}**\n> 🔍 Em Análise: **${analise}**\n> ✅ Aprovadas: **${aprovadas}**\n> ❌ Recusadas: **${recusadas}**`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, custom_id: "btn_config_canal_analise", label: "Canal de Análise", emoji: { name: "📢" } },
                        { type: 2, style: 3, custom_id: "btn_dropar_painel_sugestao", label: "Dropar Público", emoji: { name: "📦" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
            ]
        }
    ];
}

module.exports = { buildPainelSugestoes };

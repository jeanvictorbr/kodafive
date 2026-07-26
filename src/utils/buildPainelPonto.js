const { pool } = require('../database/db');

async function buildPainelPonto(interaction) {
    const config = await pool.query('SELECT canal_ponto_id, nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const conf = config.rows[0] || {};

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });
    const nomeFac = conf.nome_faccao || 'Ainda não definida';
    const canalStatus = conf.canal_ponto_id ? `<#${conf.canal_ponto_id}>` : '`❌ Não definido`';
    const canalDefault = conf.canal_ponto_id ? [{ id: conf.canal_ponto_id, type: 'channel' }] : [];

    return [
        {
            type: 17, 
            accent_color: 16711680, 
            components: [
                {
                    type: 9, 
                    components: [
                        { type: 10, content: "# ⏱️ SUBMÓDULO: Bate Ponto\nConfigure o canal onde os relatórios de carga horária vão cair e drope o painel na base pros membros." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                {
                    type: 10, 
                    content: `**🏢 Facção:** \`${nomeFac}\`\n\n### ⚙️ Status do Sistema\n> **Canal de Relatórios:** ${canalStatus}`
                },
                { 
                    type: 1, 
                    components: [{ type: 8, custom_id: "config_select_canal_ponto", placeholder: "1. Onde caem os relatórios de Ponto?", channel_types: [0], default_values: canalDefault }] 
                },
                {
                    type: 1, 
                    components: [
                        { type: 2, style: 1, custom_id: "btn_ranking_ponto", label: "Ranking de Horas", emoji: { name: "📊" } },
                        { type: 2, style: 2, custom_id: "btn_dropar_painel_ponto", label: "Dropar Painel", emoji: { name: "📦" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_gestao", label: "Voltar", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelPonto };
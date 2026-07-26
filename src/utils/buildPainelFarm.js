const { pool } = require('../database/db');

async function buildPainelFarm(interaction) {
    const config = await pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1', [interaction.guildId]);
    const conf = config.rows[0] || { item_nome: 'Dinheiro Sujo', meta_quantidade: 1000 };

    const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17, 
            accent_color: 16711680, 
            components: [
                {
                    type: 9, 
                    components: [
                        { type: 10, content: `# 📦 SUBMÓDULO: Metas de Farm\nDefina o item e a quantidade da meta semanal da **${nomeFac}** e drope o painel de entregas para os membros.` }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                {
                    type: 10, 
                    content: `### ⚙️ Meta Atual Configurada\n> **Item Exigido:** \`${conf.item_nome}\`\n> **Quantidade Meta:** \`${conf.meta_quantidade.toLocaleString()} unidades\``
                },
                { 
                    type: 1, 
                    components: [
                        { type: 2, style: 1, custom_id: "btn_config_meta_farm", label: "Definir Meta", emoji: { name: "🎯" } },
                        { type: 2, style: 2, custom_id: "btn_dropar_painel_farm", label: "Dropar Painel na Base", emoji: { name: "📦" } },
                        { type: 2, style: 1, custom_id: "btn_ranking_farm", label: "Ranking de Entregas", emoji: { name: "📊" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_gestao", label: "Voltar", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelFarm };
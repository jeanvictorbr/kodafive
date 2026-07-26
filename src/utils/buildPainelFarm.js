const { pool } = require('../database/db');

async function buildPainelFarm(interaction) {
    const guildId = interaction.guildId;
    
    // Puxa todas as metas cadastradas
    const metas = await pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1 ORDER BY id ASC', [guildId]);
    const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
    const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';

    // Puxa a foto oficial da Guilda (Guild Icon)
    const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";
    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    let listaMetas = "Nenhuma meta cadastrada no momento.";
    if (metas.rows.length > 0) {
        listaMetas = "";
        metas.rows.forEach(m => {
            listaMetas += `> **• [ID ${m.id}] ${m.item_nome}:** \`${m.meta_quantidade.toLocaleString()} un\` *(${m.ciclo.toUpperCase()})*\n`;
        });
    }

    return [
        {
            type: 17, 
            accent_color: 16711680, 
            components: [
                {
                    type: 9, // Section com a foto da Guilda na direita
                    components: [
                        { type: 10, content: `# 📦 SUBMÓDULO: Metas de Farm\nGerencie os itens, quantidades e ciclos de metas da **${nomeFac}**.` }
                    ],
                    accessory: { type: 11, media: { url: guildIcon } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10, 
                    content: `### 📋 Lista de Metas Ativas\n${listaMetas}`
                },
                { type: 14, spacing: 1, divider: true },
                { 
                    type: 1, 
                    components: [
                        { type: 2, style: 3, custom_id: "btn_add_meta_farm", label: "Adicionar Item", emoji: { name: "➕" } },
                        { type: 2, style: 1, custom_id: "btn_edit_meta_farm", label: "Editar / Excluir", emoji: { name: "✏️" } },
                        { type: 2, style: 2, custom_id: "btn_dropar_painel_farm", label: "Dropar Painel", emoji: { name: "📦" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, custom_id: "btn_ranking_farm", label: "Ranking da Tropa", emoji: { name: "📊" } },
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
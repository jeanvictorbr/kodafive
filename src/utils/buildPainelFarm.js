// src/utils/buildPainelFarm.js
const { pool } = require('../database/db');

async function buildPainelFarm(interaction) {
    const guildId = interaction.guildId;
    
    // Busca as metas e as configs do servidor no banco
    const metas = await pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1 ORDER BY id ASC', [guildId]);
    const serverConf = await pool.query('SELECT nome_faccao, ciclo_farm FROM server_config WHERE guild_id = $1', [guildId]);
    
    const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';
    const cicloAtual = (serverConf.rows[0]?.ciclo_farm || 'semanal').toUpperCase();

    const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";
    // const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 }); // (Opcional, caso queira usar na UI)

    // Monta a listagem dinâmica das metas
    let listaMetas = "Nenhuma meta cadastrada no momento.";
    if (metas.rows.length > 0) {
        listaMetas = "";
        metas.rows.forEach(m => {
            listaMetas += `> **• [ID ${m.id}] ${m.item_nome}:** \`${m.meta_quantidade.toLocaleString()} un\`\n`;
        });
    }

    // Retorna o Payload bruto no padrão Components V2
    return [
        {
            type: 17, // Container Component
            accent_color: 16711680, // Cor de destaque (Vermelho)
            components: [
                {
                    type: 9, // Section Component (Texto na esquerda, Imagem na direita)
                    components: [
                        { type: 10, content: `# 📦 SUBMÓDULO: Metas de Farm\nGerencie os itens de cobrança da **${nomeFac}**.` }
                    ],
                    accessory: { type: 11, media: { url: guildIcon } }
                },
                { type: 14, spacing: 1, divider: true }, // Separador visual
                {
                    type: 10, // TextDisplay (Markdown)
                    content: `### ⚙️ Configuração Geral\n> **Ciclo de Reset:** \`${cicloAtual}\`\n\n### 📋 Itens na Meta:\n${listaMetas}`
                },
                { type: 14, spacing: 2, divider: true },
                { 
                    type: 1, // ActionRow 1: Gestão de Itens/Metas
                    components: [
                        { type: 2, style: 3, custom_id: "btn_add_meta_farm", label: "Adicionar", emoji: { name: "➕" } },
                        { type: 2, style: 2, custom_id: "btn_edit_meta_farm", label: "Editar", emoji: { name: "✏️" } },
                        { type: 2, style: 4, custom_id: "btn_del_meta_farm", label: "Excluir", emoji: { name: "🗑️" } }
                    ]
                },
                {
                    type: 1, // ActionRow 2: Gestão do Sistema e Vitrine
                    components: [
                        { type: 2, style: 2, custom_id: "btn_mudar_ciclo_farm", label: "Mudar Ciclo", emoji: { name: "🔄" } },
                        { type: 2, style: 1, custom_id: "btn_dropar_painel_farm", label: "Dropar Vitrine", emoji: { name: "📦" } },
                        { type: 2, style: 2, custom_id: "btn_ranking_farm", label: "Ranking da Tropa", emoji: { name: "📊" } }
                    ]
                },
                {
                    type: 1, // ActionRow 3: Navegação
                    components: [
                        { type: 2, style: 2, custom_id: "btn_voltar_gestao", label: "Voltar ao Menu", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelFarm };
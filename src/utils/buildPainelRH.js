const { pool } = require('../database/db');

async function buildPainelRH(interaction) {
    // Puxa as configs do banco pra mostrar em tempo real
    const config = await pool.query('SELECT * FROM server_config WHERE guild_id = $1', [interaction.guildId]);
    const conf = config.rows[0] || {};

    // Puxa a foto de quem clicou no botão
    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    // Valores padrão pros select menus (o que já tá preenchido)
    const canalRh = conf.canal_rh_id ? [{ id: conf.canal_rh_id, type: 'channel' }] : [];
    const cargoNovato = conf.cargo_aprovado_id ? [{ id: conf.cargo_aprovado_id, type: 'role' }] : [];
    const cargoRecrutador = conf.cargo_recrutador_id ? [{ id: conf.cargo_recrutador_id, type: 'role' }] : [];
    const nomeFac = conf.nome_faccao || 'Ainda não definida';

    // Textos de Status em tempo real
    const canalStatus = conf.canal_rh_id ? `<#${conf.canal_rh_id}>` : '`❌ Não definido`';
    const novatoStatus = conf.cargo_aprovado_id ? `<@&${conf.cargo_aprovado_id}>` : '`❌ Não definido`';
    const recrutadorStatus = conf.cargo_recrutador_id ? `<@&${conf.cargo_recrutador_id}>` : '`❌ Não definido`';
    // Antes estava: conf.painel_titulo ? '`✅ Customizado`' : '`⚠️ Padrão de Fábrica`';
    const painelStatus = conf.painel_titulo ? '`🎨 Customizado`' : '`⚙️ Padrão Koda`';

    return [
        {
            type: 17, 
            accent_color: 16711680, // Linha Vermelha
            components: [
                {
                    type: 9, // Section com foto do usuário
                    components: [
                        {
                            type: 10,
                            content: "# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure quem recruta, o canal de aprovação e o design do painel público."
                        }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                {
                    type: 10, // O Resumo (Dashboard)
                    content: `**🏢 Facção:** \`${nomeFac}\`\n\n### ⚙️ Status do Sistema\n> **Canal do RH:** ${canalStatus}\n> **Cargo de Aprovado:** ${novatoStatus}\n> **Cargo Recrutador:** ${recrutadorStatus}\n> **Visual do Painel:** ${painelStatus}`
                },
                { 
                    type: 1, 
                    components: [{ type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Canal do RH (Aprovações)", channel_types: [0], default_values: canalRh }] 
                },
                { 
                    type: 1, 
                    components: [{ type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Cargo de Aprovado (Novato)", default_values: cargoNovato }] 
                },
                { 
                    type: 1, 
                    components: [{ type: 6, custom_id: "config_select_cargo_recrutador", placeholder: "3. Cargo de Recrutador (Staff)", default_values: cargoRecrutador }] 
                },
                {
                    type: 1, 
                    components: [
                        { type: 2, style: 1, custom_id: "btn_config_painel_visual", label: "Visual do Painel", emoji: { name: "🎨" } },
                        { type: 2, style: 1, custom_id: "btn_config_nome_fac", label: "Nome da Facção", emoji: { name: "🏷️" } },
                        { type: 2, style: 2, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel", emoji: { name: "📦" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_gestao", label: "Voltar", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*"
                }
            ]
        }
    ];
}

module.exports = { buildPainelRH };
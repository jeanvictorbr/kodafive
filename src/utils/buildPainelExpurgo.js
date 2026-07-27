const { pool } = require('../database/db');

async function buildPainelExpurgo(interaction) {
    const config = (await pool.query(
        'SELECT * FROM config_expurgo WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0] || {};

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    const status = config.ativo ? '✅ **Ativado**' : '❌ **Desativado**';

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 🧹 LIMPEZA & EXPURGO\nRemove cargos de membros inativos automaticamente. Configure os critérios abaixo." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### ⚙️ Configuração Atual\n> **Status:** ${status}\n> **Sem bater ponto (dias):** \`${config.dias_sem_ponto || 30}\`\n> **Sem fazer farm (dias):** \`${config.dias_sem_farm || 30}\`\n> **Aviso prévio (dias):** \`${config.aviso_dias || 5}\`\n> **Cargo a remover:** ${config.cargo_remover_id ? `<@&${config.cargo_remover_id}>` : '`Não definido`'}\n> **Cargo p/ inativo:** ${config.cargo_aplicar_id ? `<@&${config.cargo_aplicar_id}>` : '`Não definido`'}\n> **Canal de logs:** ${config.canal_log_id ? `<#${config.canal_log_id}>` : '`Não definido`'}`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, custom_id: "btn_config_expurgo", label: "Configurar", emoji: { name: "⚙️" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Expurgo Automático*" }
            ]
        }
    ];
}

module.exports = { buildPainelExpurgo };

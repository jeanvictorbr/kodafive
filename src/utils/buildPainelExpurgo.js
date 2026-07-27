const { pool } = require('../database/db');

async function buildPainelExpurgo(interaction, pagina = 1) {
    const config = (await pool.query(
        'SELECT * FROM config_expurgo WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0] || {};

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    const ativo = config.ativo === true;
    const statusEmoji = ativo ? '🟢' : '🔴';
    const statusText = ativo ? '**Ativado**' : '**Desativado**';

    const cargoRemover = config.cargo_remover_id ? `<@&${config.cargo_remover_id}>` : '`❌ Não definido`';
    const cargoAplicar = config.cargo_aplicar_id ? `<@&${config.cargo_aplicar_id}>` : '`❌ Não definido`';
    const canalLog = config.canal_log_id ? `<#${config.canal_log_id}>` : '`❌ Não definido`';

    const removerDefault = config.cargo_remover_id ? [{ id: config.cargo_remover_id, type: 'role' }] : [];
    const aplicarDefault = config.cargo_aplicar_id ? [{ id: config.cargo_aplicar_id, type: 'role' }] : [];
    const logDefault = config.canal_log_id ? [{ id: config.canal_log_id, type: 'channel' }] : [];

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 🧹 SISTEMA DE EXPURGO\nRemove cargos de membros inativos automaticamente. Configure abaixo." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### ⚙️ Como funciona\n> O bot roda **a cada 1 hora** e verifica:\n> • Quem **não bateu ponto** nos últimos \`${config.dias_sem_ponto || 30}\` dias\n> • Quem **não fez farm** nos últimos \`${config.dias_sem_farm || 30}\` dias\n> \n> Se o membro estiver inativo:\n> • Remove o cargo configurado\n> • Aplica o cargo de inativo (opcional)\n> • Registra no canal de logs\n\n### 📊 Status: ${statusEmoji} ${statusText}`
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: `### 🔧 Configurações\n> **Cargo a REMOVER:** ${cargoRemover}\n> **Cargo p/ INATIVO:** ${cargoAplicar}\n> **Canal de Logs:** ${canalLog}\n> **Dias sem ponto:** \`${config.dias_sem_ponto || 30}\`\n> **Dias sem farm:** \`${config.dias_sem_farm || 30}\`\n> **Aviso prévio:** \`${config.aviso_dias || 5}\` dias` },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 6, custom_id: "config_expurgo_cargo_remover", placeholder: "Cargo a REMOVER do inativo", default_values: removerDefault }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 6, custom_id: "config_expurgo_cargo_aplicar", placeholder: "Cargo p/ INATIVO (opcional)", default_values: aplicarDefault }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 8, custom_id: "config_expurgo_canal_log", placeholder: "Canal de Logs do Expurgo", channel_types: [0], default_values: logDefault }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: ativo ? 4 : 3, custom_id: "btn_toggle_expurgo", label: ativo ? "DESATIVAR" : "ATIVAR", emoji: ativo ? { name: "🔴" } : { name: "🟢" } },
                        { type: 2, style: 2, custom_id: "btn_config_expurgo", label: "Dias", emoji: { name: "⚙️" } },
                        { type: 2, style: 1, custom_id: "btn_analisar_expurgo", label: "Analisar Agora", emoji: { name: "🔍" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: `btn_voltar_menu_principal_p${pagina}`, label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Expurgo Automático*" }
            ]
        }
    ];
}

module.exports = { buildPainelExpurgo };

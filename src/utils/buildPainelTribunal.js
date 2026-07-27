const { pool } = require('../database/db');
const { totalPorTipo } = require('./condutaHelper');

async function buildPainelTribunal(interaction, pagina = 1) {
    const guildId = interaction.guildId;

    const [totalMultas, totalAdvertencias, totalSuspensoes, serverConf] = await Promise.all([
        totalPorTipo(guildId, 'multa'),
        totalPorTipo(guildId, 'advertencia'),
        totalPorTipo(guildId, 'suspensao', true),
        pool.query('SELECT canal_log_tribunal_id, cargo_tribunal_id FROM server_config WHERE guild_id = $1', [guildId])
    ]);

    const canalLog = serverConf.rows[0]?.canal_log_tribunal_id;
    const canalLogStatus = canalLog ? `<#${canalLog}>` : '`❌ Não definido`';
    const canalLogDefault = canalLog ? [{ id: canalLog, type: 'channel' }] : [];

    const cargoTribunal = serverConf.rows[0]?.cargo_tribunal_id;
    const cargoStatus = cargoTribunal ? `<@&${cargoTribunal}>` : '`❌ Não definido`';
    const cargoDefault = cargoTribunal ? [{ id: cargoTribunal, type: 'role' }] : [];

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 15548997,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# ⚖️ TRIBUNAL DO CRIME\nSistema de conduta e disciplina da facção." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📊 Status da Disciplina\n> **Multas Aplicadas:** \`${totalMultas}\`\n> **Advertências:** \`${totalAdvertencias}\`\n> **Suspensões Ativas:** \`${totalSuspensoes}\``
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: `### ⚙️ Configurações\n**Canal de Logs:** ${canalLogStatus}\n**Cargo com Acesso:** ${cargoStatus}\n\n> *O cargo define quem pode usar as ações do Tribunal e o menu de contexto (botão direito).*` },
                { type: 14, spacing: 1, divider: true },
                { type: 1, components: [{ type: 8, custom_id: "config_select_canal_log_tribunal", placeholder: "Canal de Logs do Tribunal", channel_types: [0], default_values: canalLogDefault }] },
                { type: 1, components: [{ type: 6, custom_id: "config_select_cargo_tribunal", placeholder: "Cargo com permissão no Tribunal", default_values: cargoDefault }] },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_tribunal_multa", label: "Aplicar Multa", emoji: { name: "💰" } },
                        { type: 2, style: 2, custom_id: "btn_tribunal_advertencia", label: "Advertência", emoji: { name: "📋" } },
                        { type: 2, style: 4, custom_id: "btn_tribunal_suspensao", label: "Suspender", emoji: { name: "🔒" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, custom_id: "btn_ver_dossie", label: "Dossiê do Membro", emoji: { name: "📄" } },
                        { type: 2, style: 3, custom_id: "btn_tribunal_ranking", label: "Ranking de Conduta", emoji: { name: "🏆" } },
                        { type: 2, style: 4, custom_id: `btn_voltar_menu_principal_p${pagina}`, label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelTribunal };

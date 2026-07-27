const { pool } = require('../database/db');

async function buildPainelSirene(interaction) {
    const config = (await pool.query(
        'SELECT cargo_alerta_id, nome_faccao FROM server_config WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0] || {};

    const cargoId = config.cargo_alerta_id;
    const nomeFac = config.nome_faccao || 'Minha Facção';

    const cargoStatus = cargoId ? `<@&${cargoId}>` : '`❌ Não definido`';
    const cargoDefault = cargoId ? [{ id: cargoId, type: 'role' }] : [];
    const role = cargoId ? interaction.guild.roles.cache.get(cargoId) : null;
    const membersCount = role ? role.members.size : 0;

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 🚨 SISTEMA DE ALERTA GERAL\nEnvie uma DM para todos os membros da facção com um aviso importante." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### ⚙️ Como funciona\n> **1.** Defina abaixo qual cargo receberá os alertas.\n> **2.** Ao disparar, o bot envia DM para **todos** os membros com esse cargo.\n> **3.** Membros com DM fechada são ignorados (contabilizado como falha).\n\n### 📊 Status\n> **Cargo alvo:** ${cargoStatus}\n> **Membros afetados:** \`${membersCount}\`\n> **Facção:** \`${nomeFac}\``
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 6, custom_id: "config_select_alerta_cargo", placeholder: "Cargo que recebe alertas", default_values: cargoDefault }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                ...(cargoId ? [{
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_confirmar_sirene", label: "🔴 DISPARAR ALERTA", emoji: { name: "🚨" } }
                    ]
                }] : []),
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Alerta Geral*" }
            ]
        }
    ];
}

module.exports = { buildPainelSirene };

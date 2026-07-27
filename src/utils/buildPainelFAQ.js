const { pool } = require('../database/db');

async function buildPainelFAQ(interaction) {
    const configs = await pool.query(
        'SELECT * FROM auto_resposta WHERE guild_id = $1 ORDER BY id ASC',
        [interaction.guildId]
    );

    let lista = '';
    if (configs.rows.length === 0) {
        lista = '> *Nenhuma resposta automática configurada.*';
    } else {
        configs.rows.forEach(r => {
            const resumo = r.resposta.length > 60 ? r.resposta.substring(0, 60) + '...' : r.resposta;
            lista += `> \`${r.palavra_chave}\` → ${resumo}\n`;
        });
    }

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 🤖 AUTO-RESPOSTA (FAQ)\nConfigure palavras-chave que o bot responde automaticamente nos canais." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📋 Palavras-chave configuradas\n${lista}`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, custom_id: "btn_add_resposta", label: "Add Palavra", emoji: { name: "➕" } },
                        { type: 2, style: 4, custom_id: "btn_del_resposta", label: "Remover", emoji: { name: "🗑️" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Auto-Resposta*" }
            ]
        }
    ];
}

module.exports = { buildPainelFAQ };

const { pool } = require('../database/db');

async function buildPainelAliancasAdmin(interaction) {
    const aliancas = await pool.query(
        'SELECT * FROM aliancas WHERE guild_id = $1 ORDER BY tipo ASC, posicao ASC',
        [interaction.guildId]
    );

    let aliancasList = '';
    let rivaisList = '';
    aliancas.rows.forEach(a => {
        const item = `> **${a.nome}** ${a.descricao ? '— ' + a.descricao : ''}\n`;
        if (a.tipo === 'alianca') aliancasList += item;
        else rivaisList += item;
    });
    if (!aliancasList) aliancasList = '> *Nenhuma aliança cadastrada.*';
    if (!rivaisList) rivaisList = '> *Nenhum rival cadastrado.*';

    const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: "# 🤝 ALIANÇAS & RIVAIS\nGerencie as parcerias e rivalidades da facção. O painel público pode ser dropado nos canais." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: `### ✅ Alianças\n${aliancasList}` },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: `### ❌ Rivais\n${rivaisList}` },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, custom_id: "btn_add_alianca", label: "Add Aliança", emoji: { name: "➕" } },
                        { type: 2, style: 4, custom_id: "btn_del_alianca", label: "Remover", emoji: { name: "🗑️" } },
                        { type: 2, style: 1, custom_id: "btn_dropar_painel_aliancas", label: "Dropar Público", emoji: { name: "📦" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Alianças*" }
            ]
        }
    ];
}

module.exports = { buildPainelAliancasAdmin };

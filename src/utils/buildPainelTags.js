const { pool } = require('../database/db');

const MAX_NICK_LENGTH = 100;

async function buildPainelTags(interaction) {
    const configs = await pool.query(
        'SELECT * FROM cargo_tags WHERE guild_id = $1 ORDER BY id ASC',
        [interaction.guildId]
    );

    const guild = interaction.guild;
    const botMember = guild.members.cache.get(interaction.client.user.id);
    const botRole = botMember?.roles.botRole;
    const botRolePos = botRole?.position ?? 0;

    let listaTags = '';
    if (configs.rows.length === 0) {
        listaTags = '> *Nenhuma tag configurada ainda.*';
    } else {
        configs.rows.forEach(c => {
            const role = guild.roles.cache.get(c.cargo_id);
            const mencao = role ? `<@&${c.cargo_id}>` : '`Cargo removido`';
            listaTags += `> ${mencao} → \`${c.tag}\`\n`;
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
                        { type: 10, content: "# 🏷️ SISTEMA DE TAGS AUTOMÁTICAS\nConfigure tags que são aplicadas automaticamente no apelido dos membros baseado no cargo deles." }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### ⚠️ Requisitos & Regras\n> **Cargo do BOT:** Deve estar **acima** dos cargos com tag na hierarquia do servidor (para ter permissão de alterar apelido).\n> **Posição atual:** ${botRole ? `<@&${botRole.id}> (posição ${botRolePos})` : 'Nenhum cargo de BOT encontrado'}\n> **Limite:** Tag + nome não pode ultrapassar **${MAX_NICK_LENGTH} caracteres**.\n> **Prioridade:** A tag do cargo **mais alto na hierarquia** é a que vale.\n> **Sem duplicatas:** O bot remove qualquer tag antiga antes de aplicar a nova.`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📋 Tags Configuradas\n${listaTags}`
                },
                { type: 14, spacing: 2, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, custom_id: "btn_add_tag", label: "Add Tag", emoji: { name: "➕" } },
                        { type: 2, style: 4, custom_id: "btn_del_tag", label: "Del Tag", emoji: { name: "🗑️" } },
                        { type: 2, style: 1, custom_id: "btn_sync_tags", label: "Sincronizar Todos", emoji: { name: "🔄" } }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Tags Automáticas*" }
            ]
        }
    ];
}

module.exports = { buildPainelTags };

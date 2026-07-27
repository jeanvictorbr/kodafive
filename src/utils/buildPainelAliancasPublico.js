const { pool } = require('../database/db');

async function buildPainelAliancasPublico(interaction) {
    const aliancas = await pool.query(
        'SELECT * FROM aliancas WHERE guild_id = $1 ORDER BY tipo ASC, posicao ASC',
        [interaction.guildId]
    );

    const nomeFac = (await pool.query(
        'SELECT nome_faccao FROM server_config WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0]?.nome_faccao || 'Nossa Facção';

    let aliancasList = '';
    let rivaisList = '';

    aliancas.rows.forEach(a => {
        const item = `> **${a.nome}** ${a.descricao ? '— ' + a.descricao : ''}\n`;
        if (a.tipo === 'alianca') aliancasList += item;
        else rivaisList += item;
    });

    if (!aliancasList && !rivaisList) {
        aliancasList = '> *Nenhuma informação cadastrada pela diretoria.*';
    }

    const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";

    const components = [
        {
            type: 9,
            components: [
                { type: 10, content: `# 🤝 Relações da ${nomeFac}\nConheça as alianças e rivalidades da nossa facção no cenário.` }
            ],
            accessory: { type: 11, media: { url: guildIcon } }
        },
        { type: 14, spacing: 1, divider: true }
    ];

    if (aliancasList) {
        components.push({ type: 10, content: `### ✅ Alianças\n${aliancasList}` });
        components.push({ type: 14, spacing: 1, divider: true });
    }
    if (rivaisList) {
        components.push({ type: 10, content: `### ❌ Rivais\n${rivaisList}` });
        components.push({ type: 14, spacing: 1, divider: true });
    }

    components.push({ type: 10, content: "*💼 KODA STUDIOS • Relações Públicas*" });

    return [{
        type: 17,
        accent_color: 16711680,
        components
    }];
}

module.exports = { buildPainelAliancasPublico };

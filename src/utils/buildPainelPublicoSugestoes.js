const { pool } = require('../database/db');

async function buildPainelPublicoSugestoes(interaction) {
    const config = (await pool.query(
        'SELECT banner_url, descricao FROM config_sugestao WHERE guild_id = $1',
        [interaction.guildId]
    )).rows[0] || {};

    const bannerUrl = config.banner_url || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = config.descricao || 'Manda tua sugestão pra gente! Pode ser sobre sisteminhas, eventos, regras ou o que vier na mente. Toda opinião é bem-vinda.';

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                { type: 12, items: [{ media: { url: bannerUrl } }] },
                { type: 10, content: `# 💡 QUER DAR UMA IDEIA?\n${descricao}` },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, custom_id: "btn_enviar_sugestao", label: "Enviar Sugestão", emoji: { name: "💡" } }
                    ]
                },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
            ]
        }
    ];
}

module.exports = { buildPainelPublicoSugestoes };

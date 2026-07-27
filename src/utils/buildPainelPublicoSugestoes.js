async function buildPainelPublicoSugestoes(interaction) {
    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                { type: 10, content: "# 💡 QUER DAR UMA IDEIA?\nManda tua sugestão pra gente! Pode ser sobre sisteminhas, eventos, regras ou o que vier na mente. Toda opinião é bem-vinda." },
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

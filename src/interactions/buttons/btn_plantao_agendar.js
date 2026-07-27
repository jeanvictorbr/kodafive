const { Routes } = require('discord.js');
const { BLOCOS } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_agendar',
    async execute(client, interaction) {
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 7, data: {
                    flags: 64,
                    components: [{
                        type: 17, accent_color: 3447003,
                        components: [
                            { type: 10, content: "### 📅 Qual horário tu vai cobrir?\nEscolhe o bloco de 3h que tu vai ficar na atividade." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [{
                                    type: 3,
                                    custom_id: 'select_plantao_horario',
                                    placeholder: 'Escolhe o horário',
                                    options: BLOCOS.map(b => ({
                                        label: b.label,
                                        value: `${b.inicio}_${b.fim}`,
                                        description: `Cobrir das ${b.inicio} às ${b.fim}`
                                    }))
                                }]
                            }
                        ]
                    }]
                }
            }
        });
    }
};

// src/interactions/modals/modal_recrutamento_form.js
const { Routes } = require('discord.js');
const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_recrutamento_form',
    async execute(client, interaction) {
        const nomeRp = interaction.fields.getTextInputValue('rec_nomerp');
        const passaporte = interaction.fields.getTextInputValue('rec_passaporte');
        const experiencia = interaction.fields.getTextInputValue('rec_experiencia');
        
        // Passa os dados pelo custom_id do select pra usar no próximo passo (gambiarra limpa de cache)
        const customIdPayload = `select_quem_recrutou_${passaporte}_${nomeRp.replace(/ /g, '-')}`;

        const menuRecrutador = [
            {
                type: 17,
                accent_color: 16753920,
                components: [
                    { type: 10, content: "# 🎯 Último Passo\nVisão, novato. Quem foi o parceiro que fez seu recrutamento? Escolha o recrutador na lista abaixo pra gente dar o mérito pro cara." },
                    {
                        type: 1,
                        components: [
                            {
                                type: 5, // USER SELECT MENU - O Discord mostra todos os membros online!
                                custom_id: "select_quem_recrutou", 
                                placeholder: "Selecione seu Recrutador..."
                            }
                        ]
                    }
                ]
            }
        ];

        // Manda o select escondido (ephemeral) só pro novato preencher
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 4, data: { flags: 32832, components: menuRecrutador } }
        });

        // Guardamos os textos no banco temporariamente (status = aguardando_recrutador)
        await pool.query(
            "INSERT INTO recrutamento (guild_id, user_id, nome_rp, passaporte, experiencia, status) VALUES ($1, $2, $3, $4, $5, 'aguardando_recrutador')", 
            [interaction.guildId, interaction.user.id, nomeRp, passaporte, experiencia]
        );
    }
};
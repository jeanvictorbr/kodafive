// src/interactions/buttons/btn_ranking_recrutadores.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_ranking_recrutadores',
    async execute(client, interaction) {
        try {
            // Puxa os dados do ranking ordenados por pontos
            const ranking = await pool.query(`
                SELECT user_id, pontos 
                FROM ranking_recrutadores 
                WHERE guild_id = $1 
                ORDER BY pontos DESC 
                LIMIT 10
            `, [interaction.guildId]);

            if (ranking.rows.length === 0) {
                return interaction.reply({ content: '⚠️ Nenhum recrutamento foi aprovado na facção ainda, chefe.', flags: 64 });
            }

            let rankingText = "# 🏆 Ranking de Recrutadores\nVisão de quem tá fechando com a tropa e trazendo os cria:\n\n";
            
            ranking.rows.forEach((row, index) => {
                let medal = "🏅";
                if(index === 0) medal = "🥇";
                if(index === 1) medal = "🥈";
                if(index === 2) medal = "🥉";

                rankingText += `> ${medal} **${index + 1}º** <@${row.user_id}>: \`${row.pontos} recrutamentos\`\n`;
            });

            // Payload V2 com borda dourada
            const payloadRanking = [
                {
                    type: 17,
                    accent_color: 16753920, // Cor Dourada
                    components: [
                        { type: 10, content: rankingText },
                        { type: 14, spacing: 1, divider: true },
                        { type: 1, components: [
                            { type: 2, style: 4, custom_id: "btn_submodulo_rec", label: "Voltar ao RH", emoji: { name: "🔙" } }
                        ]}
                    ]
                }
            ];

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadRanking } }
            });

        } catch (error) {
            console.error('[ERRO] Falha ao puxar ranking de recrutadores:', error);
            await interaction.reply({ content: 'Deu ruim ao carregar o ranking.', flags: 64 });
        }
    }
};
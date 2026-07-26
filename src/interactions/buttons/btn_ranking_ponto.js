// src/interactions/buttons/btn_ranking_ponto.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_ranking_ponto',
    async execute(client, interaction) {
        try {
            // Conta os segundos entre "saida" e "entrada", soma tudo por usuário e traz os top 10
            const ranking = await pool.query(`
                SELECT user_id, SUM(EXTRACT(EPOCH FROM (saida - entrada))) as total_segundos 
                FROM bate_ponto 
                WHERE guild_id = $1 AND status = 'fechado' 
                GROUP BY user_id 
                ORDER BY total_segundos DESC 
                LIMIT 10
            `, [interaction.guildId]);

            if (ranking.rows.length === 0) {
                return interaction.reply({ content: 'Ninguém bateu ponto fechado na facção ainda, chefe.', flags: 64 });
            }

            let rankingText = "# 🏆 Ranking de Horas Trabalhadas\nVisão de quem tá dando o sangue pela firma:\n\n";
            
            ranking.rows.forEach((row, index) => {
                const horas = Math.floor(row.total_segundos / 3600);
                const minutos = Math.floor((row.total_segundos % 3600) / 60);
                
                let medal = "🏅";
                if(index === 0) medal = "🥇";
                if(index === 1) medal = "🥈";
                if(index === 2) medal = "🥉";

                rankingText += `> ${medal} **${index + 1}º** <@${row.user_id}>: \`${horas}h ${minutos}m\`\n`;
            });

            const payloadRanking = [
                {
                    type: 17,
                    accent_color: 16753920, // Cor dourada pro Ranking
                    components: [
                        { type: 10, content: rankingText },
                        { type: 14, spacing: 1, divider: true },
                        { type: 1, components: [
                            // Esse botão vai voltar pro menu de Submódulos
                            { type: 2, style: 4, custom_id: "btn_voltar_gestao", label: "Voltar", emoji: { name: "🔙" } }
                        ]}
                    ]
                }
            ];

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadRanking } }
            });

        } catch (error) {
            console.error('[ERRO] Falha ao gerar ranking:', error);
            await interaction.reply({ content: 'Erro ao puxar o ranking do banco.', flags: 64 });
        }
    }
};
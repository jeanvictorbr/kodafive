// src/interactions/buttons/btn_ranking_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_ranking_farm',
    async execute(client, interaction) {
        try {
            const config = await pool.query('SELECT item_nome, meta_quantidade FROM meta_farm_config WHERE guild_id = $1', [interaction.guildId]);
            const conf = config.rows[0] || { item_nome: 'Itens', meta_quantidade: 1000 };

            const ranking = await pool.query(`
                SELECT user_id, SUM(quantidade) as total_farm 
                FROM entregas_farm 
                WHERE guild_id = $1 
                GROUP BY user_id 
                ORDER BY total_farm DESC 
                LIMIT 10
            `, [interaction.guildId]);

            let rankingText = `# 📊 Ranking de Farm (${conf.item_nome})\nVeja quem tá carregando a tropa nas costas:\n\n`;

            if (ranking.rows.length === 0) {
                rankingText += "> *Nenhuma entrega registrada ainda.*";
            } else {
                ranking.rows.forEach((row, index) => {
                    let medal = "🏅";
                    if(index === 0) medal = "🥇";
                    if(index === 1) medal = "🥈";
                    if(index === 2) medal = "🥉";

                    rankingText += `> ${medal} **${index + 1}º** <@${row.user_id}>: \`${parseInt(row.total_farm).toLocaleString()}x\`\n`;
                });
            }

            const payloadRanking = [
                {
                    type: 17,
                    accent_color: 16753920,
                    components: [
                        { type: 10, content: rankingText },
                        { type: 14, spacing: 1, divider: true },
                        { type: 1, components: [
                            { type: 2, style: 4, custom_id: "btn_submodulo_farm", label: "Voltar ao Farm", emoji: { name: "🔙" } }
                        ]}
                    ]
                }
            ];

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadRanking } }
            });

        } catch (error) {
            console.error('[ERRO] Falha ao gerar ranking de farm:', error);
            await interaction.reply({ content: 'Erro ao carregar o ranking.', flags: 64 });
        }
    }
};
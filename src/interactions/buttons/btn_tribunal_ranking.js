const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_tribunal_ranking',
    async execute(client, interaction) {
        const guildId = interaction.guildId;

        const ranking = await pool.query(`
            SELECT user_id, COUNT(*) as total,
                   SUM(CASE WHEN tipo = 'multa' THEN 1 ELSE 0 END) as multas,
                   SUM(CASE WHEN tipo = 'advertencia' THEN 1 ELSE 0 END) as advertencias,
                   SUM(CASE WHEN tipo = 'suspensao' THEN 1 ELSE 0 END) as suspensoes
            FROM conduta
            WHERE guild_id = $1
            GROUP BY user_id
            ORDER BY total DESC
            LIMIT 15
        `, [guildId]);

        if (ranking.rows.length === 0) {
            return interaction.reply({ content: '🏆 Nenhum registro de conduta na facção ainda.', flags: 64 });
        }

        let texto = '# 🏆 Ranking de Conduta\nOs membros com mais registros disciplinares:\n\n';

        ranking.rows.forEach((row, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
            texto += `> ${medal} **${i + 1}º** <@${row.user_id}> — ${row.total} registro(s) `;
            texto += `(💰${row.multas}x 📋${row.advertencias}x 🔒${row.suspensoes}x)\n`;
        });

        await interaction.reply({
            flags: 32832,
            components: [
                {
                    type: 17,
                    accent_color: 15548997,
                    components: [
                        { type: 10, content: texto }
                    ]
                }
            ]
        });
    }
};

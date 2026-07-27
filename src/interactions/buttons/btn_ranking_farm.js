const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_ranking_farm',
    async execute(client, interaction) {
        try {
            const guildId = interaction.guildId;
            const userId = interaction.user.id;

            const metas = await pool.query(`
                SELECT m.id, m.item_nome, m.meta_quantidade,
                       COALESCE(SUM(e.quantidade), 0) as entregue
                FROM meta_farm_config m
                LEFT JOIN entregas_farm e ON e.meta_id = m.id AND e.user_id = $1
                WHERE m.guild_id = $2
                GROUP BY m.id, m.item_nome, m.meta_quantidade
                ORDER BY m.id ASC
            `, [userId, guildId]);

            const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const nomeFac = serverConf.rows[0]?.nome_faccao || 'Facção';

            let statusText = `# 📊 Meu Status | ${nomeFac}\nVeja quanto você já entregou neste ciclo:\n\n`;

            if (metas.rows.length === 0) {
                statusText += "> *Nenhuma meta cadastrada pela diretoria.*";
            } else {
                for (const row of metas.rows) {
                    const entregue = parseInt(row.entregue);
                    const meta = row.meta_quantidade;
                    const falta = Math.max(0, meta - entregue);
                    const porcento = meta > 0 ? Math.min(100, Math.round((entregue / meta) * 100)) : 0;

                    let barra = '';
                    const blocosCheios = Math.floor(porcento / 10);
                    const blocosVazios = 10 - blocosCheios;
                    barra = '█'.repeat(blocosCheios) + '░'.repeat(blocosVazios);

                    statusText += `**${row.item_nome}**\n`;
                    statusText += `> ${barra} \`${porcento}%\`\n`;
                    statusText += `> 📦 Entregue: \`${entregue.toLocaleString()}\` | 🎯 Meta: \`${meta.toLocaleString()}\``;
                    if (falta > 0) {
                        statusText += ` | ⏳ Falta: \`${falta.toLocaleString()}\``;
                    } else {
                        statusText += ` | ✅ **Completo!**`;
                    }
                    statusText += '\n\n';
                }
            }

            const payloadStatus = [
                {
                    type: 17,
                    accent_color: 16753920,
                    components: [
                        { type: 10, content: statusText },
                        { type: 14, spacing: 1, divider: true },
                        { type: 1, components: [
                            { type: 2, style: 4, custom_id: "btn_submodulo_farm", label: "Voltar ao Farm", emoji: { name: "🔙" } }
                        ]}
                    ]
                }
            ];

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadStatus } }
            });

        } catch (error) {
            console.error('[ERRO] Falha ao carregar Meu Status:', error);
            await interaction.reply({ content: 'Erro ao carregar seu status de farm.', flags: 64 });
        }
    }
};
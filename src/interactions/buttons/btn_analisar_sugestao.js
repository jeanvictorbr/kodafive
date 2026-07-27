const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_analisar_sugestao',
    async execute(client, interaction) {
        const sugId = interaction.customId.split('_').pop();
        if (!sugId || isNaN(sugId)) return;

        const sug = (await pool.query(
            'SELECT * FROM sugestoes WHERE id = $1 AND guild_id = $2',
            [sugId, interaction.guildId]
        )).rows[0];
        if (!sug) return interaction.reply({ content: '❌ Sugestão não encontrada.', flags: 64 });

        await pool.query('UPDATE sugestoes SET status = $1 WHERE id = $2', ['analise', sugId]);

        await client.rest.patch(Routes.channelMessage(interaction.channelId, sug.mensagem_analise_id), {
            body: {
                components: [{
                    type: 17,
                    accent_color: 16753920,
                    components: [
                        { type: 10, content: `# 💡 Sugestão #${sug.id}\n> 👤 **Autor:** <@${sug.user_id}>\n\n### ${sug.titulo}\n${sug.descricao}` },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `**Status:** 🔍 **Em Análise**\n*Em análise por ${interaction.user}*` },
                        { type: 14, spacing: 1, divider: true },
                        {
                            type: 1,
                            components: [
                                { type: 2, style: 3, custom_id: `btn_aprovar_sugestao_${sugId}`, label: "Aprovar", emoji: { name: "✅" } },
                                { type: 2, style: 4, custom_id: `btn_recusar_sugestao_${sugId}`, label: "Recusar", emoji: { name: "❌" } },
                                { type: 2, style: 1, custom_id: `btn_analisar_sugestao_${sugId}`, label: "Analisando", disabled: true, emoji: { name: "🔍" } }
                            ]
                        },
                        { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
                    ]
                }]
            }
        }).catch(() => {});

        try {
            const thread = await client.channels.fetch(sug.thread_id);
            if (thread) await thread.send({ content: `🔍 **Sugestão #${sug.id} em análise** por ${interaction.user}.` });
        } catch {}

        await interaction.reply({ content: `🔍 Sugestão #${sugId} marcada como em análise.`, flags: 64 });
    }
};

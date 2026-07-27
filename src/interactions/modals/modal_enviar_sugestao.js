const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'modal_enviar_sugestao',
    async execute(client, interaction) {
        const titulo = interaction.fields.getTextInputValue('input_titulo').trim();
        const descricao = interaction.fields.getTextInputValue('input_descricao').trim();

        const config = (await pool.query(
            'SELECT canal_analise_id FROM config_sugestao WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0];

        if (!config?.canal_analise_id) {
            return interaction.reply({ content: '❌ Canal de análise não configurado.', flags: 64 });
        }

        const result = await pool.query(
            `INSERT INTO sugestoes (guild_id, user_id, titulo, descricao) VALUES ($1, $2, $3, $4) RETURNING id`,
            [interaction.guildId, interaction.user.id, titulo, descricao]
        );
        const sugId = result.rows[0].id;

        const canalAnalise = interaction.guild.channels.cache.get(config.canal_analise_id);
        if (!canalAnalise) {
            return interaction.reply({ content: '❌ Canal de análise não encontrado.', flags: 64 });
        }

        const content = `# 💡 Sugestão #${sugId}\n> 👤 **Autor:** ${interaction.user}\n\n### ${titulo}\n${descricao}`;

        const msgAnalise = await client.rest.post(Routes.channelMessages(canalAnalise.id), {
            body: {
                content: content,
                components: [
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 3, custom_id: `btn_aprovar_sugestao_${sugId}`, label: "Aprovar", emoji: { name: "✅" } },
                            { type: 2, style: 4, custom_id: `btn_recusar_sugestao_${sugId}`, label: "Recusar", emoji: { name: "❌" } },
                            { type: 2, style: 1, custom_id: `btn_analisar_sugestao_${sugId}`, label: "Em Análise", emoji: { name: "🔍" } }
                        ]
                    }
                ]
            }
        });
        const msgId = msgAnalise.id;

        const thread = await client.rest.post(
            `/channels/${canalAnalise.id}/messages/${msgId}/threads`,
            {
                body: { name: `💬 Sugestão #${sugId}: ${titulo.substring(0, 90)}`, type: 11, auto_archive_duration: 1440, rate_limit_per_user: 3 }
            }
        );
        const threadId = thread.id;

        await pool.query(
            'UPDATE sugestoes SET mensagem_analise_id = $1, thread_id = $2 WHERE id = $3',
            [msgId, threadId, sugId]
        );

        await interaction.reply({ content: `✅ Sugestão enviada! Acompanhe a discussão: <#${threadId}>`, flags: 64 });
    }
};

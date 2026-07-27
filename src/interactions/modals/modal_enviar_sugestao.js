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

        // 1. Resposta V2 no canal público com foto do autor
        const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    flags: 32768,
                    components: [{
                        type: 17,
                        accent_color: 16753920,
                        components: [
                            {
                                type: 9,
                                components: [
                                    { type: 10, content: `# 💡 Sugestão #${sugId}\n> 👤 **${interaction.user.username}** mandou a braba!` }
                                ],
                                accessory: { type: 11, media: { url: avatarUrl } }
                            },
                            { type: 14, spacing: 1, divider: true },
                            { type: 10, content: `### ${titulo}\n${descricao}` },
                            { type: 14, spacing: 1, divider: true },
                            { type: 10, content: `**Status:** 🟡 **Pendente** — os chefes vão avaliar e a discussão rola solta no canal de análise.` },
                            { type: 14, spacing: 1, divider: true },
                            { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
                        ]
                    }]
                }
            }
        });

        // 2. Mensagem no canal de análise (V1, pq channel messages não aceitam V2)
        const content = `# 💡 Sugestão #${sugId}\n👤 **Autor:** ${interaction.user}\n\n### ${titulo}\n${descricao}\n\n**Status:** 🟡 Pendente`;

        const msgAnalise = await client.rest.post(Routes.channelMessages(canalAnalise.id), {
            body: {
                content: content,
                components: [{
                    type: 1,
                    components: [
                        { type: 2, style: 3, custom_id: `btn_aprovar_sugestao_${sugId}`, label: "Aprovar", emoji: { name: "✅" } },
                        { type: 2, style: 4, custom_id: `btn_recusar_sugestao_${sugId}`, label: "Recusar", emoji: { name: "❌" } },
                        { type: 2, style: 1, custom_id: `btn_analisar_sugestao_${sugId}`, label: "Em Análise", emoji: { name: "🔍" } }
                    ]
                }]
            }
        });
        const msgId = msgAnalise.id;

        const thread = await client.rest.post(
            `/channels/${canalAnalise.id}/messages/${msgId}/threads`,
            {
                body: { name: `💬 Sugestão #${sugId}: ${titulo.substring(0, 90)}`, type: 11, auto_archive_duration: 1440, rate_limit_per_user: 3 }
            }
        );

        await pool.query(
            'UPDATE sugestoes SET mensagem_analise_id = $1, thread_id = $2 WHERE id = $3',
            [msgId, thread.id, sugId]
        );

        // Follow-up efêmero linkando a thread
        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `💬 Discussão da sugestão: <#${thread.id}>`, flags: 64 } }
        ).catch(() => {});
    }
};

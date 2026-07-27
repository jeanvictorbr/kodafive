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

        // Mensagem V2 no canal de análise (com flag 32768)
        const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        const msgAnalise = await client.rest.post(Routes.channelMessages(canalAnalise.id), {
            body: {
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
                        { type: 10, content: `**Status:** 🟡 **Pendente**` },
                        { type: 14, spacing: 1, divider: true },
                        {
                            type: 1,
                            components: [
                                { type: 2, style: 3, custom_id: `btn_sug_aprovar_${sugId}`, label: "Aprovar", emoji: { name: "✅" } },
                                { type: 2, style: 4, custom_id: `btn_sug_recusar_${sugId}`, label: "Recusar", emoji: { name: "❌" } },
                                { type: 2, style: 1, custom_id: `btn_sug_analisar_${sugId}`, label: "Em Análise", emoji: { name: "🔍" } }
                            ]
                        },
                        { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
                    ]
                }]
            }
        });
        const msgId = msgAnalise.id;

        // Thread de discussão
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

        // Só ephemeral de confirmação pro usuário
        await interaction.reply({ content: `✅ Sugestão **#${sugId}** enviada! Acompanhe a discussão: <#${thread.id}>`, flags: 64 });
    }
};

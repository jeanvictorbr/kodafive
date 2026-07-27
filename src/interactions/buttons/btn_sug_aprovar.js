const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_sug_aprovar',
    async execute(client, interaction) {
        const sugId = interaction.customId.split('_').pop();
        if (!sugId || isNaN(sugId)) return;

        const sug = (await pool.query(
            'SELECT * FROM sugestoes WHERE id = $1 AND guild_id = $2',
            [sugId, interaction.guildId]
        )).rows[0];
        if (!sug) return interaction.reply({ content: '❌ Sugestão não encontrada.', flags: 64 });

        await pool.query('UPDATE sugestoes SET status = $1 WHERE id = $2', ['aprovada', sugId]);

        const member = await interaction.guild.members.fetch(sug.user_id).catch(() => null);
        const avatarUrl = member?.user.displayAvatarURL({ extension: 'png', size: 256 }) || interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        await client.rest.patch(Routes.channelMessage(interaction.channelId, sug.mensagem_analise_id), {
            body: {
                flags: 32768,
                components: [{
                    type: 17,
                    accent_color: 65280,
                    components: [
                        {
                            type: 9,
                            components: [
                                { type: 10, content: `# 💡 Sugestão #${sug.id}\n> 👤 **${member?.user.username || 'Desconhecido'}** mandou a braba!` }
                            ],
                            accessory: { type: 11, media: { url: avatarUrl } }
                        },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `### ${sug.titulo}\n${sug.descricao}` },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `**Status:** ✅ **Aprovada** — por ${interaction.user}` },
                        { type: 14, spacing: 1, divider: true },
                        {
                            type: 1,
                            components: [
                                { type: 2, style: 3, custom_id: `btn_sug_aprovar_${sugId}`, label: "Aprovado", disabled: true, emoji: { name: "✅" } },
                                { type: 2, style: 4, custom_id: `btn_sug_recusar_${sugId}`, label: "Recusar", emoji: { name: "❌" } },
                                { type: 2, style: 1, custom_id: `btn_sug_analisar_${sugId}`, label: "Em Análise", emoji: { name: "🔍" } }
                            ]
                        },
                        { type: 10, content: "*💼 KODA STUDIOS • Sistema de Sugestões*" }
                    ]
                }]
            }
        }).catch(() => {});

        try {
            const thread = await client.channels.fetch(sug.thread_id);
            if (thread) await thread.send({ content: `✅ **Sugestão #${sug.id} aprovada** por ${interaction.user}!` });
        } catch {}

        await interaction.reply({ content: `✅ Sugestão #${sugId} aprovada!`, flags: 64 });
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'modal_tribunal_suspensao',
    async execute(client, interaction) {
        const targetId = interaction.customId.replace('modal_tribunal_suspensao_', '');
        const duracao = parseInt(interaction.fields.getTextInputValue('input_duracao'));
        const motivo = interaction.fields.getTextInputValue('input_motivo').trim();
        const guildId = interaction.guildId;

        if (isNaN(duracao) || duracao <= 0 || !motivo) {
            return interaction.reply({ content: '❌ Duração inválida ou motivo vazio.', flags: 64 });
        }

        try {
            await pool.query(
                "INSERT INTO conduta (guild_id, user_id, tipo, motivo, duracao_horas, aplicado_por) VALUES ($1, $2, 'suspensao', $3, $4, $5)",
                [guildId, targetId, motivo, duracao, interaction.user.id]
            );

            const expiraEm = new Date(Date.now() + duracao * 3600000);

            await interaction.reply({
                content: `🔒 **Suspensão aplicada!**\n\n**Membro:** <@${targetId}>\n**Duração:** \`${duracao}h\`\n**Expira:** <t:${Math.floor(expiraEm.getTime() / 1000)}:F>\n**Motivo:** ${motivo}`,
                flags: 64
            });

            const config = await pool.query('SELECT canal_log_tribunal_id FROM server_config WHERE guild_id = $1', [guildId]);
            if (config.rows[0]?.canal_log_tribunal_id) {
                const logChannel = client.channels.cache.get(config.rows[0].canal_log_tribunal_id);
                if (logChannel) {
                    const targetUser = await client.users.fetch(targetId).catch(() => null);
                    const authorUser = interaction.user;
                    const avatarUrl = targetUser?.displayAvatarURL({ extension: 'png', size: 256 }) || authorUser.displayAvatarURL({ extension: 'png', size: 256 });

                    const logPayload = [{
                        type: 17,
                        accent_color: 15548997,
                        components: [
                            {
                                type: 9,
                                components: [
                                    { type: 10, content: "# 🔒 Suspensão Aplicada\nRegistro disciplinar da facção." }
                                ],
                                accessory: { type: 11, media: { url: avatarUrl } }
                            },
                            { type: 14, spacing: 1, divider: true },
                            { type: 10, content: `**Membro:** <@${targetId}>\n**Duração:** \`${duracao}h\`\n**Expira:** <t:${Math.floor(expiraEm.getTime() / 1000)}:F>\n**Motivo:** ${motivo}\n**Aplicado por:** <@${interaction.user.id}>` },
                            { type: 14, spacing: 1, divider: true },
                            { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
                        ]
                    }];

                    await client.rest.post(Routes.channelMessages(logChannel.id), {
                        body: { flags: 32768, components: logPayload }
                    });
                }
            }

        } catch (error) {
            console.error('[ERRO] Falha ao suspender membro:', error);
            await interaction.reply({ content: 'Erro ao aplicar suspensão.', flags: 64 });
        }
    }
};

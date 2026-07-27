const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'select_plantao_horario',
    async execute(client, interaction) {
        const [horaInicio, horaFim] = interaction.values[0].split('_');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const hoje = new Date().toISOString().split('T')[0];

        const jaTem = await pool.query(
            'SELECT id FROM plantao WHERE guild_id = $1 AND user_id = $2 AND data_plantao = $3 AND hora_inicio = $4 AND status = $5',
            [guildId, userId, hoje, horaInicio, 'agendado']
        );

        if (jaTem.rows.length > 0) {
            await pool.query(
                "DELETE FROM plantao WHERE guild_id = $1 AND user_id = $2 AND data_plantao = $3 AND hora_inicio = $4 AND status = 'agendado'",
                [guildId, userId, hoje, horaInicio]
            );

            const logCfg = await pool.query(
                'SELECT plantao_log_id, plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
                [guildId]
            );
            const lr = logCfg.rows[0] || {};

            if (lr.plantao_log_id) {
                const logCanal = interaction.guild.channels.cache.get(lr.plantao_log_id);
                if (logCanal) {
                    await logCanal.send({ content: `❌ **<@${userId}>** cancelou a cobertura das **${horaInicio} às ${horaFim}**` }).catch(() => {});
                }
            }

            if (lr.plantao_msg_id && lr.plantao_msg_canal_id) {
                const canal = interaction.guild.channels.cache.get(lr.plantao_msg_canal_id);
                if (canal) {
                    try {
                        const msg = await canal.messages.fetch(lr.plantao_msg_id);
                        const painel = await buildPlantaoPublico(guildId);
                        await msg.edit({ flags: 32768, components: painel });
                    } catch {}
                }
            }

            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: [{
                    type: 17, accent_color: 15548997,
                    components: [
                        { type: 10, content: `# ❌ Desmarcado!\n<@${userId}> cancelou a cobertura das **${horaInicio} às ${horaFim}**.` }
                    ]
                }] } }
            });
        }

        const cargoCfg = await pool.query(
            'SELECT cargo_plantao_id FROM server_config WHERE guild_id = $1',
            [guildId]
        );
        const cargoPlantaoId = cargoCfg.rows[0]?.cargo_plantao_id || null;

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        const hasPerm = !cargoPlantaoId || (member && member.roles.cache.has(cargoPlantaoId));

        if (!cargoPlantaoId || hasPerm) {
            const cargos = [
                { label: '🏛️ Liderança', value: 'Liderança', description: 'Coordenação geral' },
                { label: '📋 Recrutador', value: 'Recrutador', description: 'Responsável por recrutas' },
                { label: '⚖️ Gerente', value: 'Gerente', description: 'Gestão de membros' },
            ];

            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 7, data: {
                        flags: 32832,
                        components: [{
                            type: 17, accent_color: 3447003,
                            components: [
                                { type: 10, content: `### 📅 Cobertura ${horaInicio} às ${horaFim}\nQual cargo tu vai exercer nesse horário?` },
                                { type: 14, spacing: 1, divider: true },
                                {
                                    type: 1,
                                    components: [{
                                        type: 3,
                                        custom_id: `select_plantao_cargo_fixo_${horaInicio}_${horaFim}`,
                                        placeholder: 'Escolhe a função',
                                        options: cargos
                                    }]
                                }
                            ]
                        }]
                    }
                }
            });
        }

        return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: [{
                type: 17, accent_color: 15548997,
                components: [
                    { type: 10, content: '# ⛔ Sem permissão\nTu não tem o cargo necessário pra agendar cobertura.' }
                ]
            }] } }
        });
    }
};

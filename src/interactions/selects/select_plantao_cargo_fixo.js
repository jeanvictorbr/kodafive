const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'select_plantao_cargo_fixo',
    async execute(client, interaction) {
        const cargo = interaction.values[0];
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const hoje = new Date().toISOString().split('T')[0];

        const match = interaction.customId.match(/select_plantao_cargo_fixo_(\d{2}:\d{2})_(\d{2}:\d{2})/);
        if (!match) return;
        const horaInicio = match[1];
        const horaFim = match[2];

        await pool.query(
            'INSERT INTO plantao (guild_id, user_id, cargo, tipo, data_plantao, hora_inicio, hora_fim, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [guildId, userId, cargo, 'agendado', hoje, horaInicio, horaFim, 'agendado']
        );

        const config = await pool.query(
            'SELECT plantao_log_id, plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
            [guildId]
        );
        const r = config.rows[0] || {};

        if (r.plantao_log_id) {
            const logCanal = interaction.guild.channels.cache.get(r.plantao_log_id);
            if (logCanal) {
                await logCanal.send({ content: `📅 **<@${userId}>** agendou cobertura das **${horaInicio} às ${horaFim}** como **${cargo}**` }).catch(() => {});
            }
        }

        if (r.plantao_msg_id && r.plantao_msg_canal_id) {
            const canal = interaction.guild.channels.cache.get(r.plantao_msg_canal_id);
            if (canal) {
                try {
                    const msg = await canal.messages.fetch(r.plantao_msg_id);
                    const painel = await buildPlantaoPublico(guildId);
                    await msg.edit({ flags: 32768, components: painel });
                } catch {}
            }
        }

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: [{
                type: 17, accent_color: 4437377,
                components: [
                    { type: 10, content: `# ✅ Agendado!\n<@${userId}> vai cobrir **${horaInicio} às ${horaFim}** como **${cargo}** hoje.` },
                    { type: 14, spacing: 1, divider: true },
                    { type: 10, content: "Chegou o horário? Volta no painel e clica em **✅ Assumir Agora** pra ativar." }
                ]
            }] } }
        });
    }
};

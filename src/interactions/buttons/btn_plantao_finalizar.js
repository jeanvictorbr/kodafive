const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_finalizar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const result = await pool.query(
            "UPDATE plantao SET fim = NOW(), status = 'finalizado' WHERE guild_id = $1 AND user_id = $2 AND status = 'ativo' RETURNING cargo, inicio",
            [guildId, userId]
        );

        if (result.rows.length === 0) {
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 64, components: [{
                    type: 17, accent_color: 15548997,
                    components: [
                        { type: 10, content: '# ⚠️ Tu não tem plantão ativo\nVai no painel e clica em **✅ Assumir Agora** primeiro.' }
                    ]
                }] } }
            });
        }

        const { cargo, inicio } = result.rows[0];
        const diffMs = Date.now() - new Date(inicio).getTime();
        const horas = Math.floor(diffMs / 3600000);
        const minutos = Math.floor((diffMs % 3600000) / 60000);
        const duracao = `${horas}h ${minutos}min`;

        const config = await pool.query(
            'SELECT plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
            [guildId]
        );
        const r = config.rows[0] || {};

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
            body: { type: 7, data: { flags: 64, components: [{
                type: 17, accent_color: 15548997,
                components: [
                    { type: 10, content: `# 🔴 Plantão Encerrado\n<@${userId}> — **${cargo}** — duração: **${duracao}**\n\nValeu pelo tempo de atividade!` }
                ]
            }] } }
        });
    }
};

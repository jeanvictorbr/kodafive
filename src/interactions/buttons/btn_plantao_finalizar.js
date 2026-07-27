const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_finalizar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const ehV2 = interaction.message?.flags?.bitfield & 32832;

        const result = await pool.query(
            "UPDATE plantao SET fim = NOW(), status = 'finalizado' WHERE guild_id = $1 AND user_id = $2 AND status = 'ativo' RETURNING cargo, inicio",
            [guildId, userId]
        );

        if (result.rows.length > 0) {
            const { cargo, inicio } = result.rows[0];
            const diffMs = Date.now() - new Date(inicio).getTime();
            const horas = Math.floor(diffMs / 3600000);
            const minutos = Math.floor((diffMs % 3600000) / 60000);
            const duracao = `${horas}h ${minutos}min`;

            const config = await pool.query(
                'SELECT canal_plantao_id, plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
                [guildId]
            );
            const r = config.rows[0] || {};

            if (r.canal_plantao_id) {
                const canal = interaction.guild.channels.cache.get(r.canal_plantao_id);
                if (canal) {
                    await canal.send({ content: `📋 **<@${userId}>** encerrou o plantão (**${cargo}**) — duração: **${duracao}**` }).catch(() => {});
                }
            }

            if (r.plantao_msg_id && r.plantao_msg_canal_id) {
                const canal = interaction.guild.channels.cache.get(r.plantao_msg_canal_id);
                if (canal) {
                    try {
                        const msg = await canal.messages.fetch(r.plantao_msg_id);
                        const { embeds, components } = await buildPlantaoPublico(guildId);
                        await msg.edit({ embeds, components });
                    } catch {}
                }
            }
        }

        if (ehV2) {
            const painel = await buildPainelPlantao(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } else {
            const { embeds, components } = await buildPlantaoPublico(guildId);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { embeds, components } }
            });
        }
    }
};

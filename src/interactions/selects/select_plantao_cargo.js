const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'select_plantao_cargo',
    async execute(client, interaction) {
        const cargo = interaction.values[0];
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const ehV2 = interaction.message?.flags?.bitfield & 32832;

        await pool.query(
            'INSERT INTO plantao (guild_id, user_id, cargo, inicio, status) VALUES ($1, $2, $3, NOW(), $4)',
            [guildId, userId, cargo, 'ativo']
        );

        const config = await pool.query(
            'SELECT canal_plantao_id, plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
            [guildId]
        );
        const r = config.rows[0] || {};

        if (r.canal_plantao_id) {
            const canal = interaction.guild.channels.cache.get(r.canal_plantao_id);
            if (canal) {
                await canal.send({ content: `📋 **<@${userId}>** assumiu o plantão como **${cargo}**` }).catch(() => {});
            }
        }

        if (r.plantao_msg_id && r.plantao_msg_canal_id) {
            const canal = interaction.guild.channels.cache.get(r.plantao_msg_canal_id);
            if (canal) {
                try {
                    const msg = await canal.messages.fetch(r.plantao_msg_id);
                    const { embeds, components } = await buildPlantaoPublico(guildId, userId);
                    await msg.edit({ embeds, components });
                } catch {}
            }
        }

        if (ehV2) {
            const painel = await buildPainelPlantao(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } else {
            const { embeds, components } = await buildPlantaoPublico(guildId, userId);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { embeds, components } }
            });
        }
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_iniciar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const paginaMatch = interaction.customId.match(/_p(\d+)$/);
        const ehV2 = paginaMatch !== null;
        const pagina = parseInt(paginaMatch?.[1]) || 1;

        const ativo = await pool.query(
            "SELECT id FROM plantao WHERE guild_id = $1 AND user_id = $2 AND status = 'ativo'",
            [guildId, userId]
        );
        if (ativo.rows.length > 0) {
            if (ehV2) {
                const painel = await buildPainelPlantao(interaction, pagina);
                return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32832, components: painel } }
                });
            }
            const { embeds, components } = await buildPlantaoPublico(guildId, userId);
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { embeds, components } }
            });
        }

        await pool.query(
            'INSERT INTO plantao (guild_id, user_id, inicio, status) VALUES ($1, $2, NOW(), $3)',
            [guildId, userId, 'ativo']
        );

        const config = await pool.query('SELECT canal_plantao_id FROM server_config WHERE guild_id = $1', [guildId]);
        const canalId = config.rows[0]?.canal_plantao_id;
        if (canalId) {
            const canal = interaction.guild.channels.cache.get(canalId);
            if (canal) await canal.send({ content: `📋 **<@${userId}> entrou de plantão!**` }).catch(() => {});
        }

        if (ehV2) {
            const painel = await buildPainelPlantao(interaction, pagina);
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

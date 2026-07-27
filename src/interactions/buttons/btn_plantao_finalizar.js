const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_finalizar',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const paginaMatch = interaction.customId.match(/_p(\d+)$/);
        const ehV2 = paginaMatch !== null;
        const pagina = parseInt(paginaMatch?.[1]) || 1;

        const result = await pool.query(
            "UPDATE plantao SET fim = NOW(), status = 'finalizado' WHERE guild_id = $1 AND user_id = $2 AND status = 'ativo' RETURNING inicio",
            [guildId, userId]
        );

        if (result.rows.length > 0) {
            const inicio = result.rows[0].inicio;
            const diffMs = Date.now() - new Date(inicio).getTime();
            const horas = Math.floor(diffMs / 3600000);
            const minutos = Math.floor((diffMs % 3600000) / 60000);
            const duracao = `${horas}h ${minutos}min`;

            const config = await pool.query('SELECT canal_plantao_id FROM server_config WHERE guild_id = $1', [guildId]);
            const canalId = config.rows[0]?.canal_plantao_id;
            if (canalId) {
                const canal = interaction.guild.channels.cache.get(canalId);
                if (canal) await canal.send({ content: `📋 **<@${userId}> finalizou o plantão** — duração: **${duracao}**` }).catch(() => {});
            }
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

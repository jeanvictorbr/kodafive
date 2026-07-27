const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_publicar',
    async execute(client, interaction) {
        const canalId = (await pool.query(
            'SELECT canal_plantao_id FROM server_config WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0]?.canal_plantao_id;

        if (!canalId) {
            const painel = await buildPainelPlantao(interaction);
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        }

        const canal = interaction.guild.channels.cache.get(canalId);
        if (!canal) {
            const painel = await buildPainelPlantao(interaction);
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        }

        const { embeds, components } = await buildPlantaoPublico(interaction.guildId);
        const msg = await canal.send({ embeds, components });

        await pool.query(
            'UPDATE server_config SET plantao_msg_id = $1, plantao_msg_canal_id = $2 WHERE guild_id = $3',
            [msg.id, canalId, interaction.guildId]
        );

        const painel = await buildPainelPlantao(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

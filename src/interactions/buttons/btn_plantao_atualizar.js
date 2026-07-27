const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'btn_plantao_atualizar',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const config = (await pool.query(
            'SELECT plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0];

        if (config?.plantao_msg_id && config?.plantao_msg_canal_id) {
            const canal = interaction.guild.channels.cache.get(config.plantao_msg_canal_id);
            if (canal) {
                try {
                    const msg = await canal.messages.fetch(config.plantao_msg_id);
                    const { embeds, components } = await buildPlantaoPublico(interaction.guildId);
                    await msg.edit({ embeds, components });
                } catch {}
            }
        }

        const painel = await buildPainelPlantao(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

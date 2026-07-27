const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');
const { buildPainelFarm } = require('../../utils/buildPainelFarm');

module.exports = {
    customId: 'btn_confirmar_reset_farm',
    async execute(client, interaction) {
        const guildId = interaction.guildId;

        await pool.query('DELETE FROM entregas_farm WHERE guild_id = $1', [guildId]);
        await pool.query('UPDATE meta_farm_config SET meta_atual = 0 WHERE guild_id = $1', [guildId]);

        await atualizarVitrineFarm(client, guildId);

        const painelFarm = await buildPainelFarm(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painelFarm } }
        });

        const config = await pool.query('SELECT canal_log_farm_id FROM server_config WHERE guild_id = $1', [guildId]);
        if (config.rows[0]?.canal_log_farm_id) {
            const logChannel = client.channels.cache.get(config.rows[0].canal_log_farm_id);
            if (logChannel) {
                await client.rest.post(Routes.channelMessages(logChannel.id), {
                    body: {
                        flags: 32768,
                        components: [
                            {
                                type: 17,
                                accent_color: 15548997,
                                components: [
                                    {
                                        type: 9,
                                        components: [
                                            { type: 10, content: "# 🔄 Placar de Farm Resetado" }
                                        ],
                                        accessory: { type: 11, media: { url: interaction.user.displayAvatarURL({ extension: 'png', size: 256 }) } }
                                    },
                                    { type: 14, spacing: 1, divider: true },
                                    { type: 10, content: `**Resetado por:** <@${interaction.user.id}>\n**Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\nTodas as entregas foram zeradas. Novo ciclo iniciado!` },
                                    { type: 14, spacing: 1, divider: true },
                                    { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
                                ]
                            }
                        ]
                    }
                });
            }
        }
    }
};

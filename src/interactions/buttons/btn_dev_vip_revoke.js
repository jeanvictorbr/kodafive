const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_vip_revoke',
    async execute(client, interaction) {
        const guildId = interaction.customId.replace('btn_dev_vip_revoke_', '');
        if (!guildId) return;

        await pool.query(
            "UPDATE server_config SET is_vip = false, vip_expira_em = NULL, vip_origem = 'key', vip_doado_por = NULL, vip_doado_em = NULL WHERE guild_id = $1",
            [guildId]
        );

        const painel = await buildPainelDev(client, 1, guildId);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

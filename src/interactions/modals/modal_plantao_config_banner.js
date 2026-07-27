const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');

module.exports = {
    customId: 'modal_plantao_config_banner',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const url = interaction.fields.getTextInputValue('input_banner_url').trim();
        if (!url.startsWith('http')) {
            return interaction.reply({ content: '❌ URL inválida. Precisa começar com http.', flags: 64 });
        }
        await pool.query(
            'UPDATE server_config SET plantao_banner = $1 WHERE guild_id = $2',
            [url, interaction.guildId]
        );
        const painel = await buildPainelPlantao(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

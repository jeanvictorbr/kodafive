const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelPlantao } = require('../../utils/buildPainelPlantao');

module.exports = {
    customId: 'modal_plantao_config_desc',
    async execute(client, interaction) {
        const pagina = parseInt(interaction.customId.match(/_p(\d+)$/)?.[1]) || 1;
        const texto = interaction.fields.getTextInputValue('input_desc_texto').trim();
        if (texto.length < 1) {
            return interaction.reply({ content: '❌ Descrição não pode ficar vazia.', flags: 64 });
        }
        await pool.query(
            'UPDATE server_config SET plantao_desc = $1 WHERE guild_id = $2',
            [texto, interaction.guildId]
        );
        const painel = await buildPainelPlantao(interaction, pagina);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelTags } = require('../../utils/buildPainelTags');

module.exports = {
    customId: 'select_del_tag',
    async execute(client, interaction) {
        const tagId = parseInt(interaction.values[0]);

        try {
            const result = await pool.query(
                'DELETE FROM cargo_tags WHERE id = $1 AND guild_id = $2 RETURNING tag',
                [tagId, interaction.guildId]
            );

            if (result.rows.length === 0) {
                return interaction.reply({ content: '❌ Tag não encontrada.', flags: 64 });
            }

            const painel = await buildPainelTags(interaction);

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 7,
                    data: { flags: 32832, components: painel }
                }
            });

        } catch (error) {
            console.error('[TAG] Erro ao excluir tag:', error);
            await interaction.reply({ content: '❌ Erro ao excluir tag.', flags: 64 });
        }
    }
};

const { pool } = require('../../database/db');

module.exports = {
    customId: 'select_add_tag_role',
    async execute(client, interaction) {
        const roleId = interaction.values[0];

        const existente = await pool.query(
            'SELECT id FROM cargo_tags WHERE guild_id = $1 AND cargo_id = $2',
            [interaction.guildId, roleId]
        );

        if (existente.rows.length > 0) {
            return interaction.reply({
                content: `❌ O cargo <@&${roleId}> **já possui uma tag configurada.** Remova a existente primeiro.`,
                flags: 64
            });
        }

        const role = interaction.guild.roles.cache.get(roleId);
        const nomeCargo = role ? role.name : 'Cargo';

        await interaction.showModal({
            custom_id: `modal_add_tag_${roleId}`,
            title: `Tag para ${nomeCargo.substring(0, 45)}`,
            components: [
                {
                    type: 18,
                    label: "Tag (ex: [LIDER], [GER], [MEM])",
                    component: { type: 4, custom_id: "input_tag", style: 1, min_length: 1, max_length: 20, placeholder: "[LIDER]", required: true }
                }
            ]
        });
    }
};

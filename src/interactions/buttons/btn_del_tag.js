const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_del_tag',
    async execute(client, interaction) {
        const configs = await pool.query(
            'SELECT * FROM cargo_tags WHERE guild_id = $1 ORDER BY id ASC',
            [interaction.guildId]
        );

        if (configs.rows.length === 0) {
            return interaction.reply({ content: '❌ Nenhuma tag configurada para excluir.', flags: 64 });
        }

        const options = configs.rows.map(c => {
            const role = interaction.guild.roles.cache.get(c.cargo_id);
            return {
                label: role ? `${role.name} (${c.tag})` : `Cargo removido (${c.tag})`,
                value: c.id.toString(),
                description: role ? `Tag: ${c.tag}` : 'Cargo foi removido do servidor'
            };
        });

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 16711680,
                        components: [
                            { type: 10, content: "🗑️ Selecione a tag que deseja excluir:" },
                            { type: 14, spacing: 1, divider: true },
                            { type: 1, components: [{
                                type: 3,
                                custom_id: "select_del_tag",
                                placeholder: "Escolha uma tag para excluir...",
                                options: options
                            }]}
                        ]
                    }]
                }
            }
        });
    }
};

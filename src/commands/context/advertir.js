const { pool } = require('../../database/db');

module.exports = {
    name: 'Advertir',
    type: 2,
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const config = await pool.query('SELECT cargo_tribunal_id FROM server_config WHERE guild_id = $1', [guildId]);
        const cargoId = config.rows[0]?.cargo_tribunal_id;

        if (cargoId && !interaction.member.roles.cache.has(cargoId)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar isso.', flags: 64 });
        }

        const modal = {
            type: 9,
            data: {
                custom_id: `modal_tribunal_advertencia_${interaction.targetId}`,
                title: "Dar Advertência",
                components: [
                    {
                        type: 18,
                        label: "Motivo da Advertência",
                        component: { type: 4, custom_id: "input_motivo", style: 2, placeholder: "Descumprimento de ordens", required: true, max_length: 500 }
                    }
                ]
            }
        };
        await interaction.showModal(modal.data);
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    name: 'Aplicar Multa',
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
                custom_id: `modal_tribunal_multa_${interaction.targetId}`,
                title: "Aplicar Multa",
                components: [
                    {
                        type: 18,
                        label: "Valor da Multa (em R$)",
                        component: { type: 4, custom_id: "input_valor", style: 1, placeholder: "5000", required: true }
                    },
                    {
                        type: 18,
                        label: "Motivo",
                        component: { type: 4, custom_id: "input_motivo", style: 2, placeholder: "Desrespeito às regras da facção", required: true, max_length: 500 }
                    }
                ]
            }
        };
        await interaction.showModal(modal.data);
    }
};

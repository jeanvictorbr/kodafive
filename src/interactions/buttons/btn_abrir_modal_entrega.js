// src/interactions/buttons/btn_abrir_modal_entrega.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_abrir_modal_entrega',
    async execute(client, interaction) {
        const metas = await pool.query('SELECT id, item_nome FROM meta_farm_config WHERE guild_id = $1', [interaction.guildId]);

        if (metas.rows.length === 0) {
            return interaction.reply({ content: '⚠️ A diretoria ainda não configurou nenhuma meta de farm na facção.', flags: 64 });
        }

        const modalEntrega = {
            type: 9,
            data: {
                custom_id: "modal_registrar_entrega_farm",
                title: "Registrar Entrega de Farm",
                components: [
                    {
                        type: 18,
                        label: "Digite o ID do Item da Meta acima:",
                        component: { type: 4, custom_id: "input_meta_id", style: 1, placeholder: "Ex: 1", required: true }
                    },
                    {
                        type: 18,
                        label: "Quantidade Entregue:",
                        component: { type: 4, custom_id: "input_quantidade", style: 1, placeholder: "Ex: 250", required: true }
                    }
                ]
            }
        };
        await interaction.showModal(modalEntrega.data);
    }
};
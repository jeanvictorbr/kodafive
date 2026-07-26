// src/interactions/buttons/btn_config_meta_farm.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_meta_farm',
    async execute(client, interaction) {
        const config = await pool.query('SELECT item_nome, meta_quantidade FROM meta_farm_config WHERE guild_id = $1', [interaction.guildId]);
        const conf = config.rows[0] || { item_nome: 'Dinheiro Sujo', meta_quantidade: 1000 };

        const modalMeta = {
            type: 9,
            data: {
                custom_id: "modal_config_meta_farm",
                title: "Configurar Meta de Farm",
                components: [
                    { 
                        type: 18, 
                        label: "Nome do Item (Ex: C4, Dinheiro Sujo, Colete)", 
                        component: { type: 4, custom_id: "input_item_nome", style: 1, value: conf.item_nome, required: true } 
                    },
                    { 
                        type: 18, 
                        label: "Quantidade Meta (Apenas números)", 
                        component: { type: 4, custom_id: "input_meta_qtd", style: 1, value: String(conf.meta_quantidade), required: true } 
                    }
                ]
            }
        };
        await interaction.showModal(modalMeta.data);
    }
};
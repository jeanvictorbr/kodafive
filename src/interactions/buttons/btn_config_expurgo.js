const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_expurgo',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT * FROM config_expurgo WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        await interaction.showModal({
            custom_id: 'modal_config_expurgo',
            title: 'Configurar Expurgo',
            components: [
                {
                    type: 18,
                    label: 'Dias sem ponto para inatividade',
                    component: { type: 4, custom_id: "input_dias_ponto", style: 1, value: String(config.dias_sem_ponto || 30), required: true }
                },
                {
                    type: 18,
                    label: 'Dias sem farm para inatividade',
                    component: { type: 4, custom_id: "input_dias_farm", style: 1, value: String(config.dias_sem_farm || 30), required: true }
                },
                {
                    type: 18,
                    label: 'Dias de aviso prévio antes de remover',
                    component: { type: 4, custom_id: "input_aviso", style: 1, value: String(config.aviso_dias || 5), required: true }
                }
            ]
        });
    }
};

const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_canal_analise',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT canal_analise_id FROM config_sugestao WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        await interaction.showModal({
            custom_id: 'modal_config_canal_analise',
            title: 'Canal de Análise',
            components: [
                {
                    type: 18,
                    label: 'ID do canal para análise',
                    component: { type: 4, custom_id: "input_channel_id", style: 1, value: config.canal_analise_id || '', placeholder: "123456789012345678", required: true }
                }
            ]
        });
    }
};

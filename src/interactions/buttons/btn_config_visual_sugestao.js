const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_visual_sugestao',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT banner_url, descricao FROM config_sugestao WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        await interaction.showModal({
            custom_id: 'modal_config_visual_sugestao',
            title: 'Visual do Painel Público',
            components: [
                {
                    type: 18,
                    label: 'URL do Banner',
                    component: { type: 4, custom_id: "input_banner", style: 1, value: config.banner_url || 'https://i.ibb.co/68037k9/banner-placeholder.png', placeholder: "https://i.ibb.co/...", required: true }
                },
                {
                    type: 18,
                    label: 'Descrição do Painel',
                    component: { type: 4, custom_id: "input_descricao", style: 2, value: config.descricao || '', max_length: 500, placeholder: "Manda tua sugestão pra gente!", required: true }
                }
            ]
        });
    }
};

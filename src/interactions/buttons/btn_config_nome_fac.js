const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_nome_fac',
    async execute(client, interaction) {
        const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const nomeAtual = config.rows[0]?.nome_faccao || 'Sua Facção';

        const modalFac = {
            type: 9,
            data: {
                custom_id: "modal_nome_fac",
                title: "Identidade da Facção",
                components: [
                    {
                        type: 18, 
                        label: "Qual o nome da sua organização?",
                        component: { type: 4, custom_id: "input_nome_fac", style: 1, min_length: 2, max_length: 50, value: nomeAtual, required: true }
                    }
                ]
            }
        };
        await interaction.showModal(modalFac.data);
    }
};
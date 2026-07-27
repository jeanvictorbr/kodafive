const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_add_resposta',
    async execute(client, interaction) {
        const existentes = await pool.query(
            'SELECT COUNT(*) as total FROM auto_resposta WHERE guild_id = $1',
            [interaction.guildId]
        );
        if (parseInt(existentes.rows[0].total) >= 20) {
            return interaction.reply({ content: '❌ Limite de 20 palavras-chave por servidor.', flags: 64 });
        }

        await interaction.showModal({
            custom_id: 'modal_add_resposta',
            title: 'Nova Palavra-chave',
            components: [
                {
                    type: 18,
                    label: 'Palavra-chave (ex: regras, recrutamento)',
                    component: { type: 4, custom_id: "input_palavra", style: 1, min_length: 1, max_length: 50, placeholder: "regras", required: true }
                },
                {
                    type: 18,
                    label: 'Resposta automática',
                    component: { type: 4, custom_id: "input_resposta", style: 2, min_length: 1, max_length: 1000, placeholder: "As regras da facção são...", required: true }
                }
            ]
        });
    }
};

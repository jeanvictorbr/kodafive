const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_del_alianca',
    async execute(client, interaction) {
        const aliancas = await pool.query(
            'SELECT * FROM aliancas WHERE guild_id = $1 ORDER BY id ASC',
            [interaction.guildId]
        );
        if (aliancas.rows.length === 0) {
            return interaction.reply({ content: '❌ Nenhuma relação cadastrada.', flags: 64 });
        }

        await interaction.reply({
            content: '🗑️ Selecione para remover:',
            flags: 64,
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "select_del_alianca",
                    placeholder: "Escolha uma relação...",
                    options: aliancas.rows.slice(0, 25).map(a => ({
                        label: a.nome.length > 25 ? a.nome.substring(0, 25) : a.nome,
                        value: a.id.toString(),
                        description: a.tipo === 'alianca' ? '✅ Aliança' : '❌ Rival'
                    }))
                }]
            }]
        });
    }
};

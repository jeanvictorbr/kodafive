const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_del_resposta',
    async execute(client, interaction) {
        const configs = await pool.query(
            'SELECT * FROM auto_resposta WHERE guild_id = $1 ORDER BY id ASC',
            [interaction.guildId]
        );
        if (configs.rows.length === 0) {
            return interaction.reply({ content: '❌ Nenhuma palavra-chave cadastrada.', flags: 64 });
        }

        await interaction.reply({
            content: '🗑️ Selecione a palavra-chave para remover:',
            flags: 64,
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "select_del_resposta",
                    placeholder: "Escolha uma palavra...",
                    options: configs.rows.slice(0, 25).map(r => ({
                        label: r.palavra_chave.length > 25 ? r.palavra_chave.substring(0, 25) : r.palavra_chave,
                        value: r.id.toString(),
                        description: (r.resposta || '').substring(0, 50)
                    }))
                }]
            }]
        });
    }
};

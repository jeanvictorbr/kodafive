const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_nome_fac',
    async execute(client, interaction) {
        const novoNome = interaction.fields.getTextInputValue('input_nome_fac');
        await pool.query(
            `INSERT INTO server_config (guild_id, nome_faccao) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET nome_faccao = $2`, 
            [interaction.guildId, novoNome]
        );
        await interaction.reply({ content: `✅ Identidade visual atualizada! O bot vai chamar sua firma de **${novoNome}**.`, flags: 64 });
    }
};
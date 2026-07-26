const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_painel_visual',
    async execute(client, interaction) {
        const titulo = interaction.fields.getTextInputValue('input_titulo');
        const desc = interaction.fields.getTextInputValue('input_desc');
        const banner = interaction.fields.getTextInputValue('input_banner');
        const rodape = interaction.fields.getTextInputValue('input_rodape');

        await pool.query(
            `INSERT INTO server_config (guild_id, painel_titulo, painel_desc, painel_banner, painel_rodape) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (guild_id) DO UPDATE 
             SET painel_titulo = $2, painel_desc = $3, painel_banner = $4, painel_rodape = $5`, 
            [interaction.guildId, titulo, desc, banner, rodape]
        );

        await interaction.reply({ 
            content: `✅ Visual do painel público customizado no capricho! Drope o painel na rua pra ver a mágica.`, 
            ephemeral: true 
        });
    }
};
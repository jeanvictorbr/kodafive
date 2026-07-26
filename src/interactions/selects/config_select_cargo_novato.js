const { pool } = require('../../database/db');

module.exports = {
    customId: 'config_select_cargo_novato',
    async execute(client, interaction) {
        const cargoId = interaction.values[0];
        await pool.query(
            `INSERT INTO server_config (guild_id, cargo_aprovado_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET cargo_aprovado_id = $2`, 
            [interaction.guildId, cargoId]
        );
        await interaction.reply({ content: `✅ Cargo de Novato (Aprovado) setado pra <@&${cargoId}>.`, flags: 64 });
    }
};
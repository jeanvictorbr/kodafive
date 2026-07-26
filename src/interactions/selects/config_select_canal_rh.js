const { pool } = require('../../database/db');

module.exports = {
    customId: 'config_select_canal_rh',
    async execute(client, interaction) {
        const canalId = interaction.values[0];
        await pool.query(
            `INSERT INTO server_config (guild_id, canal_rh_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_rh_id = $2`, 
            [interaction.guildId, canalId]
        );
        // Usamos flags: 64 no lugar de ephemeral: true
        await interaction.reply({ content: `✅ Canal de RH setado pra <#${canalId}>. As fichas vão cair lá.`, flags: 64 });
    }
};
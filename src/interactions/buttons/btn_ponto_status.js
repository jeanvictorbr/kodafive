// src/interactions/buttons/btn_ponto_status.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_ponto_status',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        try {
            const aberto = await pool.query(
                "SELECT entrada FROM bate_ponto WHERE guild_id = $1 AND user_id = $2 AND status = 'aberto' ORDER BY id DESC LIMIT 1", 
                [guildId, userId]
            );

            if (aberto.rows.length === 0) {
                return interaction.reply({ content: '📊 Você está **fora de serviço** no momento.', flags: 64 });
            }

            const entradaTime = new Date(aberto.rows[0].entrada);
            const agora = new Date();
            const diffSegundos = Math.floor((agora - entradaTime) / 1000);
            const horas = Math.floor(diffSegundos / 3600);
            const minutos = Math.floor((diffSegundos % 3600) / 60);

            await interaction.reply({ content: `🟢 Você está **em serviço** há \`${horas}h ${minutos}m\` desde \`${entradaTime.toLocaleTimeString()}\`.`, flags: 64 });

        } catch (error) {
            console.error('[ERRO] Falha ao checar status do ponto:', error);
            await interaction.reply({ content: 'Erro ao puxar seu status.', flags: 64 });
        }
    }
};
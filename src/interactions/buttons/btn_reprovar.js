const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_reprovar',
    async execute(client, interaction) {
        const targetUserId = interaction.customId.split('_')[2];
        const guildId = interaction.guildId;

        try {
            // 1. Atualiza banco
            await pool.query("UPDATE recrutamento SET status = 'reprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

            // 2. Edita a mensagem do RH
            const updatePayload = [
                { 
                    type: 17, 
                    accent_color: 16711680, // Borda Vermelha
                    components: [
                        { type: 10, content: `# ❌ Ficha Recusada\nA ficha do <@${targetUserId}> foi mandada pro lixo por <@${interaction.user.id}>.` }
                    ] 
                }
            ];
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), { 
                body: { type: 7, data: { flags: 32768, components: updatePayload } } 
            });

            // 3. Manda DM triste
            const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
            
            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                await member.send(`Foi mal, chefe. Sua ficha para a **${nomeFac}** foi **REPROVADA** pela diretoria. Tenta de novo na próxima leva.`).catch(() => null);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao reprovar novato:', error);
        }
    }
};
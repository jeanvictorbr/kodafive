// src/interactions/buttons/btn_reprovar.js
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

            // 2. Puxa a foto do candidato
            const targetUser = await client.users.fetch(targetUserId).catch(() => null);
            const avatarUrl = targetUser ? targetUser.displayAvatarURL({ extension: 'png', size: 256 }) : "https://i.ibb.co/68037k9/banner-placeholder.png";

            // 3. Edita a mensagem mantendo a foto e o layout premium V2
            const updatePayload = [
                { 
                    type: 17, 
                    accent_color: 16711680, // Vermelho de recusa
                    components: [
                        {
                            type: 9, // Section: Mantém a foto do candidato na direita
                            components: [
                                { type: 10, content: `# ❌ Ficha Recusada\nA ficha do candidato <@${targetUserId}> foi mandada pro lixo por <@${interaction.user.id}>.` }
                            ],
                            accessory: { type: 11, media: { url: avatarUrl } }
                        }
                    ] 
                }
            ];

            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 7, 
                        data: {
                            flags: 32768, 
                            components: updatePayload
                        }
                    }
                }
            );

            // 4. Manda DM pro membro avisando
            const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
            
            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                await member.send(`Foi mal, chefe. Sua ficha para a **${nomeFac}** foi **REPROVADA** pela diretoria.`).catch(() => null);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao reprovar novato:', error);
        }
    }
};
// src/interactions/buttons/btn_aprovar.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_aprovar',
    async execute(client, interaction) {
        const targetUserId = interaction.customId.split('_')[2];
        const guildId = interaction.guildId;

        try {
            // 1. Descobre quem foi o staff que recrutou
            const ficha = await pool.query("SELECT recrutador_id FROM recrutamento WHERE user_id = $1 AND status = 'pendente' ORDER BY id DESC LIMIT 1", [targetUserId]);
            const recrutadorId = ficha.rows[0]?.recrutador_id;

            // 2. Atualiza a ficha como 'aprovado'
            await pool.query("UPDATE recrutamento SET status = 'aprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

            // 3. Soma +1 ponto pro recrutador
            if (recrutadorId) {
                await pool.query(`
                    INSERT INTO ranking_recrutadores (guild_id, user_id, pontos) 
                    VALUES ($1, $2, 1) 
                    ON CONFLICT (guild_id, user_id) 
                    DO UPDATE SET pontos = ranking_recrutadores.pontos + 1
                `, [guildId, recrutadorId]);
            }

            // 4. Puxa a foto do candidato para manter na miniatura (accessory)
            const targetUser = await client.users.fetch(targetUserId).catch(() => null);
            const avatarUrl = targetUser ? targetUser.displayAvatarURL({ extension: 'png', size: 256 }) : "https://i.ibb.co/68037k9/banner-placeholder.png";

            // 5. Edita a mensagem do RH mantendo o padrão V2 com a foto e sem os botões
            const updatePayload = [
                { 
                    type: 17, 
                    accent_color: 65280, // Verde de sucesso
                    components: [
                        {
                            type: 9, // Section: Mantém a foto do candidato na direita
                            components: [
                                { type: 10, content: `# ✅ Ficha Aprovada!\nA ficha do candidato <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.` }
                            ],
                            accessory: { type: 11, media: { url: avatarUrl } }
                        },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `📈 *+1 Ponto contabilizado com sucesso pro recrutador* <@${recrutadorId}>!` }
                    ] 
                }
            ];

            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 7, 
                        data: {
                            flags: 32768, // Mantém o modo V2
                            components: updatePayload
                        }
                    }
                }
            );

            // 6. Dá o cargo e manda DM pro novato
            const config = await pool.query('SELECT cargo_aprovado_id, nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const cargoId = config.rows[0]?.cargo_aprovado_id;
            const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
            
            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                if (cargoId) await member.roles.add(cargoId).catch(() => null);
                await member.send(`Visão! Sua ficha para a **${nomeFac}** foi **APROVADA** pelo RH. Cola na base.`).catch(() => null);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao aprovar novato:', error);
        }
    }
};
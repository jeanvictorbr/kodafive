const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_aprovar',
    async execute(client, interaction) {
        // O ID original do botão vem como btn_aprovar_123456789, a gente pega só o número
        const targetUserId = interaction.customId.split('_')[2];
        const guildId = interaction.guildId;

        try {
            // 1. Descobre quem foi o cara da Staff que recrutou o novato
            const ficha = await pool.query("SELECT recrutador_id FROM recrutamento WHERE user_id = $1 AND status = 'pendente' ORDER BY id DESC LIMIT 1", [targetUserId]);
            const recrutadorId = ficha.rows[0]?.recrutador_id;

            // 2. Atualiza a ficha como 'Aprovada'
            await pool.query("UPDATE recrutamento SET status = 'aprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

            // 3. Sistema de Pontuação (Upsert: Cria o registro do Staff ou soma +1 se já existir)
            if (recrutadorId) {
                await pool.query(`
                    INSERT INTO ranking_recrutadores (guild_id, user_id, pontos) 
                    VALUES ($1, $2, 1) 
                    ON CONFLICT (guild_id, user_id) 
                    DO UPDATE SET pontos = ranking_recrutadores.pontos + 1
                `, [guildId, recrutadorId]);
            }

            // 4. Edita a mensagem da Ficha no RH tirando os botões e avisando do ponto
            const updatePayload = [
                { 
                    type: 17, 
                    accent_color: 65280, // Borda Verde de Sucesso
                    components: [
                        { type: 10, content: `# ✅ Ficha Aprovada!\nA ficha do <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.\n*📈 +1 Ponto contabilizado pro recrutador <@${recrutadorId}>!*` }
                    ] 
                }
            ];
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), { 
                body: { type: 7, data: { flags: 32768, components: updatePayload } } 
            });

            // 5. Dá o Cargo e Manda DM pro Novato puxando o nome da Facção
            const config = await pool.query('SELECT cargo_aprovado_id, nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const cargoId = config.rows[0]?.cargo_aprovado_id;
            const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
            
            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                if (cargoId) await member.roles.add(cargoId).catch(() => console.log('[AVISO] Sem permissão para dar o cargo.'));
                await member.send(`Visão! Sua ficha para a **${nomeFac}** foi **APROVADA** pelo RH. Cola na base pra pegar o radinho e o kit iniciante.`).catch(() => null);
            }

        } catch (error) {
            console.error('[ERRO] Falha ao aprovar novato:', error);
        }
    }
};
// src/interactions/selects/select_quem_recrutou.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'select_quem_recrutou',
    async execute(client, interaction) {
        const recrutadorId = interaction.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        try {
            // 1. Atualiza a ficha com o recrutador selecionado
            await pool.query(
                "UPDATE recrutamento SET recrutador_id = $1, status = 'pendente' WHERE user_id = $2 AND status = 'aguardando_recrutador'",
                [recrutadorId, userId]
            );

            // 2. Avisa o novato via REST puro (Bypass V2) para não dar o erro de legacy content
            const payloadSucesso = [
                {
                    type: 17,
                    accent_color: 65280, // Verde
                    components: [{ type: 10, content: "✅ **Tudo certo!** Sua ficha foi enviada pro RH. Aguarde o radinho." }]
                }
            ];

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: payloadSucesso } }
            });

            // 3. Puxa os dados completos pra montar a ficha
            const ficha = await pool.query("SELECT * FROM recrutamento WHERE user_id = $1 AND status = 'pendente' ORDER BY id DESC LIMIT 1", [userId]);
            const dados = ficha.rows[0];
            
            const config = await pool.query('SELECT canal_rh_id FROM server_config WHERE guild_id = $1', [guildId]);
            const canalRhId = config.rows[0]?.canal_rh_id;

            // 4. Manda pro RH em formato Premium
            if (canalRhId && dados) {
                const hrPayload = [
                    {
                        type: 17,
                        accent_color: 16753920,
                        components: [
                            { type: 10, content: `# 📋 Nova Ficha na Mesa!\n**Candidato:** <@${userId}>\n**Nome RP:** \`${dados.nome_rp}\`\n**Passaporte:** \`${dados.passaporte}\`\n**Recrutador Responsável:** <@${recrutadorId}>\n\n### 📝 Histórico no Crime:\n> ${dados.experiencia}` },
                            { type: 1, components: [
                                { type: 2, style: 3, custom_id: `btn_aprovar_${userId}`, label: "Aprovar Cria", emoji: { name: "✅" } },
                                { type: 2, style: 4, custom_id: `btn_reprovar_${userId}`, label: "Mandar Ralar", emoji: { name: "❌" } }
                            ]}
                        ]
                    }
                ];
                await client.rest.post(Routes.channelMessages(canalRhId), {
                    body: { flags: 32768, components: hrPayload }
                });
            }
        } catch (error) {
            console.error('[ERRO] Falha ao finalizar recrutamento:', error);
        }
    }
};
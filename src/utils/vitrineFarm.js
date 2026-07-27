const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pool } = require('../database/db'); // Puxa a conexão do seu banco

async function atualizarVitrineFarm(client, guildId) {
    try {
        // 1. PUXA DO BANCO DE DADOS REAL (NADA DE MEMÓRIA RAM)
        const query = await pool.query(
            'SELECT canal_vitrine_id, msg_vitrine_id, meta_atual, meta_total, item_nome, ciclo FROM farm_config WHERE guild_id = $1',
            [guildId]
        );

        // Se não tem configuração de vitrine salva no banco, sai quieto
        if (query.rowCount === 0) return;

        const dbFarm = query.rows[0];

        // Se a vitrine não foi dropada ainda (IDs nulos), sai quieto
        if (!dbFarm.canal_vitrine_id || !dbFarm.msg_vitrine_id) return;

        // 2. Busca o Canal e a Mensagem de forma blindada
        let channel;
        try {
            channel = client.channels.cache.get(dbFarm.canal_vitrine_id) || await client.channels.fetch(dbFarm.canal_vitrine_id);
        } catch (err) { return; }

        let message;
        try {
            message = channel.messages.cache.get(dbFarm.msg_vitrine_id) || await channel.messages.fetch(dbFarm.msg_vitrine_id);
        } catch (err) { return; }

        // 3. Monta o Payload V2 com os dados QUE VIERAM DO BANCO
        const payloadV2 = {
            flags: 32768, 
            components: [
                {
                    type: 17, 
                    accent_color: 3092790, 
                    components: [
                        { type: 10, content: "## 🌿 | Progresso do Farm da Facção\n\nAcompanhe a cota atual da quebrada, tropa." },
                        { type: 14, spacing: 1, divider: true },
                        { 
                            type: 10, 
                            // Puxa as variáveis reais que vieram da query
                            content: `**Meta Global:** \`${dbFarm.meta_atual} / ${dbFarm.meta_total} ${dbFarm.item_nome}\`\n**Status:** ${dbFarm.ciclo}` 
                        },
                        { type: 14, spacing: 2, divider: false },
                        {
                            type: 1, 
                            components: [
                                {
                                    type: 2, 
                                    style: 1, 
                                    label: "Meu Progresso",
                                    custom_id: "btn_ver_progresso_farm",
                                    emoji: { name: "🎒" }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        // 4. Edita a mensagem vitrine
        await message.edit(payloadV2);
        console.log(`[SISTEMA] Vitrine do Farm (${guildId}) sincronizada direto do Banco de Dados!`);

    } catch (error) {
        console.error('[ERRO] Falha ao atualizar vitrine do banco:', error);
    }
}

module.exports = { atualizarVitrineFarm };
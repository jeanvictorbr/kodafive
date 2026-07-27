// src/utils/vitrineFarm.js
const { pool } = require('../database/db');

async function atualizarVitrineFarm(client, guildId) {
    try {
        // 1. Puxa os IDs do painel e o ciclo global salvos na configuração do servidor
        const serverConf = await pool.query(
            'SELECT canal_vitrine_farm, msg_vitrine_farm, ciclo_farm, nome_faccao FROM server_config WHERE guild_id = $1',
            [guildId]
        );

        if (serverConf.rowCount === 0) return;
        const conf = serverConf.rows[0];

        // Se a vitrine não foi dropada ainda, ignora silenciosamente
        if (!conf.canal_vitrine_farm || !conf.msg_vitrine_farm) return;

        // 2. Busca o Canal e a Mensagem
        const channel = client.channels.cache.get(conf.canal_vitrine_farm) || await client.channels.fetch(conf.canal_vitrine_farm).catch(() => null);
        if (!channel) return;

        const message = channel.messages.cache.get(conf.msg_vitrine_farm) || await channel.messages.fetch(conf.msg_vitrine_farm).catch(() => null);
        if (!message) return;

        // 3. Puxa todos os itens da meta e calcula o progresso de cada um
        const metas = await pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1 ORDER BY id ASC', [guildId]);
        
        let listaMetas = "";
        if (metas.rows.length === 0) {
            listaMetas = "> *Nenhuma meta ativa no momento. Aguarde a diretoria.*";
        } else {
            for (const m of metas.rows) {
                listaMetas += `> **• [ID ${m.id}] ${m.item_nome}:** \`${m.meta_quantidade.toLocaleString()} un\`\n`;
            }
        }

        const guildIcon = message.guild?.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";
        const cicloAtual = (conf.ciclo_farm || 'semanal').toUpperCase();

        // 4. Monta o Payload V2 Dinâmico
        const payloadV2 = {
            flags: 32768, 
            components: [
                {
                    type: 17, 
                    accent_color: 16711680, 
                    components: [
                        {
                            type: 9, 
                            components: [
                                { type: 10, content: `# 📦 Central de Entregas | ${conf.nome_faccao}\nAcompanhe a cota atual da quebrada, tropa.` }
                            ],
                            accessory: { type: 11, media: { url: guildIcon } }
                        },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `### 🎯 Progresso Atual (${cicloAtual}):\n${listaMetas}` },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: "Clica no botão abaixo para registrar a sua parte no corre." },
                        {
                            type: 1, 
                            components: [
                                { type: 2, style: 3, custom_id: "btn_abrir_modal_entrega", label: "Registrar Entrega", emoji: { name: "📝" } },
                                { type: 2, style: 2, custom_id: "btn_ver_progresso_farm", label: "Meu Status", emoji: { name: "📊" } }
                            ]
                        },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: "*💼 KODA STUDIOS • Sistema de Metas Automatizado*" }
                    ]
                }
            ]
        };

        // 5. Edita a mensagem vitrine
        await message.edit(payloadV2);
        console.log(`[SISTEMA] Vitrine do Farm (${guildId}) sincronizada com o banco!`);

    } catch (error) {
        console.error('[ERRO] Falha ao atualizar vitrine do banco:', error);
    }
}

module.exports = { atualizarVitrineFarm };
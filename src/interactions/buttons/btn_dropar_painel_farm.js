// src/interactions/buttons/btn_dropar_painel_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dropar_painel_farm',
    async execute(client, interaction) {
        const config = await pool.query('SELECT item_nome, meta_quantidade FROM meta_farm_config WHERE guild_id = $1', [interaction.guildId]);
        const conf = config.rows[0] || { item_nome: 'Dinheiro Sujo', meta_quantidade: 1000 };

        const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';

        const painelPublicoFarm = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    { type: 10, content: `# 📦 Central de Entregas | ${nomeFac}\nA meta atual da firma é farmar **${conf.meta_quantidade.toLocaleString()}x ${conf.item_nome}**.\n\nClica no botão abaixo para registrar a sua parte no corre.` },
                    { type: 1, components: [
                        { type: 2, style: 3, custom_id: "btn_abrir_modal_entrega", label: "Registrar Entrega", emoji: { name: "📝" } },
                        { type: 2, style: 2, custom_id: "btn_ver_progresso_farm", label: "Ver Progresso da Tropa", emoji: { name: "📊" } }
                    ]},
                    { type: 10, content: "*Sistema de Metas Automatizado*" }
                ]
            }
        ];
        
        try {
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painelPublicoFarm }
            });
            await interaction.reply({ content: '✅ Painel de Farm dropado na base com sucesso!', flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao dropar painel de farm:', error);
            await interaction.reply({ content: 'Deu ruim ao dropar o painel.', flags: 64 });
        }
    }
};
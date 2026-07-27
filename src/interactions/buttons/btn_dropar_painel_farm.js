// src/interactions/buttons/btn_dropar_painel_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');

module.exports = {
    customId: 'btn_dropar_painel_farm',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        
        // Puxa as configurações da facção
        const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
        const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';
        
        // Puxa a foto oficial do servidor (Guild Icon)
        const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";

        // Monta o payload base (Os itens e progresso reais serão injetados pela vitrineFarm na sequência)
        const painelPublicoFarm = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    {
                        type: 9, // Section com a foto da Guilda na direita
                        components: [
                            { type: 10, content: `# 📦 Central de Entregas | ${nomeFac}\n> ⏳ *Sincronizando dados com a base...*` }
                        ],
                        accessory: { type: 11, media: { url: guildIcon } }
                    },
                    { type: 14, spacing: 1, divider: true },
                    { 
                        type: 10, 
                        content: "Clica no botão abaixo para registrar o seu corre e enviar o print de comprovação." 
                    },
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
        ];
        
        try {
            // 1. Dropa o painel e captura os dados da mensagem enviada
            const msgDropada = await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painelPublicoFarm }
            });

            // 2. Salva o ID da mensagem no banco para a vitrine conseguir se achar depois
            await pool.query(
                'UPDATE server_config SET canal_vitrine_farm = $1, msg_vitrine_farm = $2 WHERE guild_id = $3',
                [interaction.channelId, msgDropada.id, guildId]
            );

            await interaction.reply({ content: '✅ Painel de Farm atualizado com a foto da guilda e dropado na base!', flags: 64 });

            // 3. Atualiza a mensagem na mesma hora para exibir os itens reais e o progresso
            await atualizarVitrineFarm(client, guildId);

        } catch (error) {
            console.error('[ERRO] Falha ao dropar painel de farm:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Deu ruim ao dropar o painel.', flags: 64 });
            }
        }
    }
};
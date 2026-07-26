// src/interactions/buttons/btn_dropar_painel_farm.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dropar_painel_farm',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        
        // Puxa todas as metas cadastradas para este servidor
        const metas = await pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1 ORDER BY id ASC', [guildId]);
        const serverConf = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
        const nomeFac = serverConf.rows[0]?.nome_faccao || 'Nossa Facção';
        
        // Puxa a foto oficial do servidor (Guild Icon)
        const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || "https://i.ibb.co/68037k9/banner-placeholder.png";

        let listaMetasTexto = "Ainda não há metas cadastradas pela diretoria.";
        
        if (metas.rows.length > 0) {
            listaMetasTexto = "### 🎯 Metas Ativas da Tropa:\n";
            metas.rows.forEach(m => {
                listaMetasTexto += `> **• ${m.item_nome}:** \`${m.meta_quantidade.toLocaleString()} un\` (${m.ciclo.toUpperCase()})\n`;
            });
        }

        const painelPublicoFarm = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    {
                        type: 9, // Section com a foto da Guilda na direita
                        components: [
                            { type: 10, content: `# 📦 Central de Entregas | ${nomeFac}\n${listaMetasTexto}` }
                        ],
                        accessory: { type: 11, media: { url: guildIcon } }
                    },
                    { type: 14, spacing: 1, divider: true }, // Divisor pedido
                    { 
                        type: 10, 
                        content: "Clica no botão abaixo para registrar o seu corre e enviar o print de comprovação." 
                    },
                    { 
                        type: 1, 
                        components: [
                            { type: 2, style: 3, custom_id: "btn_abrir_modal_entrega", label: "Registrar Entrega", emoji: { name: "📝" } },
                            { type: 2, style: 2, custom_id: "btn_ver_progresso_farm", label: "Progresso da Tropa", emoji: { name: "📊" } }
                        ]
                    },
                    { type: 14, spacing: 1, divider: true },
                    { type: 10, content: "*💼 KODA STUDIOS • Sistema de Metas Automatizado*" }
                ]
            }
        ];
        
        try {
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painelPublicoFarm }
            });
            await interaction.reply({ content: '✅ Painel de Farm atualizado com a foto da guilda e dropado na base!', flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao dropar painel de farm:', error);
            await interaction.reply({ content: 'Deu ruim ao dropar o painel.', flags: 64 });
        }
    }
};
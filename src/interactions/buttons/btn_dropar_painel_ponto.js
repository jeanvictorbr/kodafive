// src/interactions/buttons/btn_dropar_painel_ponto.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dropar_painel_ponto',
    async execute(client, interaction) {
        // Puxa o nome da facção no banco
        const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';

        const painelPonto = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    { 
                        type: 10, 
                        content: `# ⏱️ Relógio de Ponto | ${nomeFac}\nRapaziada, não esquece de bater o ponto quando entrar e sair da cidade. Quem não bate ponto não sobe de cargo.` 
                    },
                    { type: 1, components: [
                        { type: 2, style: 3, custom_id: "btn_ponto_entrar", label: "Iniciar Serviço", emoji: { name: "🟢" } },
                        { type: 2, style: 4, custom_id: "btn_ponto_sair", label: "Finalizar Serviço", emoji: { name: "🔴" } },
                        { type: 2, style: 2, custom_id: "btn_ponto_status", label: "Meu Status", emoji: { name: "📋" } }
                    ]},
                    { type: 10, content: "*Sistema de Controle de Ponto*" }
                ]
            }
        ];
        
        try {
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painelPonto }
            });
            await interaction.reply({ content: '✅ Painel de Ponto dropado na rua com sucesso!', flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao dropar painel de ponto:', error);
            await interaction.reply({ content: 'Deu ruim ao dropar o painel, chefe.', flags: 64 });
        }
    }
};
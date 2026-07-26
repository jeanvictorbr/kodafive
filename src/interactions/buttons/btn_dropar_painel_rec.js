// src/interactions/buttons/btn_dropar_painel_rec.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dropar_painel_rec',
    async execute(client, interaction) {
        const config = await pool.query('SELECT painel_titulo, painel_desc, painel_banner, painel_rodape FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const conf = config.rows[0] || {};
        
        const titulo = conf.painel_titulo || '📝 Recrutamento da Facção';
        const desc = conf.painel_desc || 'Visão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho.';
        const banner = conf.painel_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
        const rodape = conf.painel_rodape || 'Sistema de Recrutamento';

        const painelPublico = [
            {
                type: 17,
                accent_color: 16711680,
                components: [
                    { type: 12, items: [{ media: { url: banner } }] },
                    { type: 10, content: `# ${titulo}\n${desc}` },
                    { 
                        type: 1, 
                        components: [
                            { type: 2, style: 3, custom_id: "btn_abrir_modal_novato", label: "Preencher Ficha", emoji: { name: "✍️" } }
                        ]
                    },
                    { type: 10, content: `*${rodape}*` } // Rodapé deslocado pro final
                ]
            }
        ];
        
        try {
            await client.rest.post(Routes.channelMessages(interaction.channelId), {
                body: { flags: 32768, components: painelPublico }
            });
            await interaction.reply({ content: 'Painel dropado com sucesso! Já tá com a lataria nova.', flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao dropar painel customizado:', error);
        }
    }
};
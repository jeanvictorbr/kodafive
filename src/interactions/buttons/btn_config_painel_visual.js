const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_config_painel_visual',
    async execute(client, interaction) {
        // Puxa o que já tem no banco
        const config = await pool.query('SELECT painel_titulo, painel_desc, painel_banner, painel_rodape FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const conf = config.rows[0] || {};
        
        // Define o que vai aparecer preenchido (Customizado ou Padrão)
        const titulo = conf.painel_titulo || '📝 Recrutamento da Facção';
        const desc = conf.painel_desc || 'Visão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho.';
        const banner = conf.painel_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
        const rodape = conf.painel_rodape || 'Sistema de Recrutamento';

        const modalVisual = {
            type: 9,
            data: {
                custom_id: "modal_painel_visual",
                title: "Visual do Painel Público",
                components: [
                    { 
                        type: 18, 
                        label: "Título do Painel", 
                        component: { type: 4, custom_id: "input_titulo", style: 1, max_length: 100, value: titulo, required: true } 
                    },
                    { 
                        type: 18, 
                        label: "Descrição", 
                        component: { type: 4, custom_id: "input_desc", style: 2, max_length: 500, value: desc, required: true } 
                    },
                    { 
                        type: 18, 
                        label: "Link do Banner (URL da Imagem)", 
                        component: { type: 4, custom_id: "input_banner", style: 1, value: banner, required: true } 
                    },
                    { 
                        type: 18, 
                        label: "Rodapé", 
                        component: { type: 4, custom_id: "input_rodape", style: 1, max_length: 50, value: rodape, required: true } 
                    }
                ]
            }
        };
        await interaction.showModal(modalVisual.data);
    }
};
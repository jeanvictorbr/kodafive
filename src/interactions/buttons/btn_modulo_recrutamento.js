// src/interactions/buttons/btn_modulo_recrutamento.js
const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_modulo_recrutamento',
    async execute(client, interaction) {
        // Puxa as configs do banco pra mostrar em tempo real no Dashboard
        const config = await pool.query('SELECT * FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const conf = config.rows[0] || {};

        // Monta os valores padrão (se já tiver configurado, o Discord já mostra preenchido)
        const canalRh = conf.canal_rh_id ? [{ id: conf.canal_rh_id, type: 'channel' }] : [];
        const cargoNovato = conf.cargo_aprovado_id ? [{ id: conf.cargo_aprovado_id, type: 'role' }] : [];
        const cargoRecrutador = conf.cargo_recrutador_id ? [{ id: conf.cargo_recrutador_id, type: 'role' }] : [];
        const nomeFac = conf.nome_faccao || 'Ainda não definida';

        const subModuloRH = [
            {
                type: 17, 
                accent_color: 16711680,
                components: [
                    {
                        type: 10,
                        content: `# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure quem recruta, o canal de aprovação e o design do painel público.\n\n**🏢 Facção:** \`${nomeFac}\``
                    },
                    { 
                        type: 1, 
                        components: [{ type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Canal do RH (Aprovações)", channel_types: [0], default_values: canalRh }] 
                    },
                    { 
                        type: 1, 
                        components: [{ type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Cargo de Aprovado (Novato)", default_values: cargoNovato }] 
                    },
                    { 
                        type: 1, 
                        components: [{ type: 6, custom_id: "config_select_cargo_recrutador", placeholder: "3. Cargo de Recrutador (Staff)", default_values: cargoRecrutador }] 
                    },
                    {
                        type: 1, 
                        components: [
                            { type: 2, style: 1, custom_id: "btn_config_painel_visual", label: "Visual do Painel", emoji: { name: "🎨" } },
                            { type: 2, style: 1, custom_id: "btn_config_nome_fac", label: "Nome da Facção", emoji: { name: "🏷️" } },
                            { type: 2, style: 2, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel", emoji: { name: "📦" } },
                            { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar", emoji: { name: "🔙" } }
                        ]
                    },
                    { type: 14, spacing: 1, divider: true }, // Separador
                    {
                        type: 10,
                        content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" // Rodapé da gestão
                    }
                ]
            }
        ];

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: subModuloRH } }
        });
    }
};
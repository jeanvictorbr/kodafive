// src/interactions/buttons/btn_modulo_recrutamento.js
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_modulo_recrutamento',
    async execute(client, interaction) {
        const subModuloRH = [
            {
                type: 17, 
                accent_color: 16711680,
                components: [
                    {
                        type: 10,
                        content: "# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure quem recruta, o canal de aprovação e o design do painel público."
                    },
                    { type: 1, components: [{ type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Canal do RH (Aprovações)", channel_types: [0] }] },
                    { type: 1, components: [{ type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Cargo de Aprovado (Novato)" }] },
                    { type: 1, components: [{ type: 6, custom_id: "config_select_cargo_recrutador", placeholder: "3. Cargo de Recrutador (Staff)" }] }, // NOVO SELETOR
                    {
                        type: 1, 
                        components: [
                            { type: 2, style: 1, custom_id: "btn_config_painel_visual", label: "Visual do Painel", emoji: { name: "🎨" } }, // NOVO BOTÃO
                            { type: 2, style: 1, custom_id: "btn_config_nome_fac", label: "Nome da Facção", emoji: { name: "🏷️" } },
                            { type: 2, style: 2, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel", emoji: { name: "📦" } },
                            { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar", emoji: { name: "🔙" } }
                        ]
                    }
                ]
            }
        ];

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: subModuloRH } }
        });
    }
};
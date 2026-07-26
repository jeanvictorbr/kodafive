// src/events/interactionCreate.js
const { pool } = require('../database/db');

module.exports = async (client, interaction) => {

    // ==========================================
    // NAVEGAÇÃO DOS BOTÕES NO QG DO PATRÃO
    // ==========================================
    if (interaction.isButton()) {
        const { customId } = interaction;

        // 1. GESTÃO CLICOU PARA EXPLORAR O RH
        if (customId === 'btn_modulo_recrutamento') {
            const subModuloRH = {
                flags: 32768,
                components: [
                    {
                        type: 10,
                        content: "# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure a base do seu RH. Selecione o canal onde as fichas vão cair para aprovação e, quando tiver tudo pronto, drope o painel na rua pros novatos preencherem."
                    },
                    {
                        type: 1, // Menu de Seleção de Canal
                        components: [
                            {
                                type: 8, // Channel Select
                                custom_id: "config_select_canal_rh",
                                placeholder: "1. Onde as fichas do RH vão cair?",
                                channel_types: [0] // Só canais de texto
                            }
                        ]
                    },
                    {
                        type: 1, // Menu de Seleção de Cargo
                        components: [
                            {
                                type: 6, // Role Select
                                custom_id: "config_select_cargo_novato",
                                placeholder: "2. Qual cargo o novato aprovado recebe?"
                            }
                        ]
                    },
                    {
                        type: 1, // Botões de Ação do RH
                        components: [
                            { type: 2, style: 1, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel Público", emoji: { name: "📦" } },
                            { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                        ]
                    }
                ]
            };
            // Atualiza a mesma mensagem com a tela do submódulo
            return interaction.update(subModuloRH);
        }

        // 2. GESTÃO CLICOU EM VOLTAR AO MENU PRINCIPAL
        if (customId === 'btn_voltar_menu_principal') {
            // Recria o payload do kodafive original
            const payloadOriginal = {
                flags: 32768, 
                components: [
                    {
                        type: 10,
                        content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`\n\n### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH.\n\n### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2.\n\n### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP."
                    },
                    {
                        type: 1, 
                        components: [
                            { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar Gestão", emoji: { name: "📋" } },
                            { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar Arsenal", emoji: { name: "🔫" } },
                            { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar Tribunal", emoji: { name: "⚖️" } }
                        ]
                    },
                    {
                        type: 1, 
                        components: [
                            { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                            { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                            { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } },
                            { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                        ]
                    }
                ]
            };
            return interaction.update(payloadOriginal);
        }

        // 3. GESTÃO DROPANDO O PAINEL DE RECRUTAMENTO NA RUA
        if (customId === 'btn_dropar_painel_rec') {
            const painelPublico = {
                flags: 32768,
                components: [
                    {
                        type: 10,
                        content: "# 📝 Recrutamento da Facção Aberto!\nVisão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho. Não adianta floodar."
                    },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 3, custom_id: "btn_abrir_modal_novato", label: "Preencher Ficha", emoji: { name: "✍️" } }
                        ]
                    }
                ]
            };
            
            // Manda o painel no mesmo canal onde a gestão executou o comando
            await interaction.channel.send(painelPublico);
            return interaction.reply({ content: 'Painel dropado com sucesso nesse canal, chefe!', ephemeral: true });
        }

        // 4. NOVATO CLICANDO NO PAINEL PÚBLICO (ABRE O MODAL)
        if (customId === 'btn_abrir_modal_novato') {
            const modalPayload = {
                type: 9, 
                data: {
                    custom_id: "modal_recrutamento_form",
                    title: "Ficha de Recrutamento",
                    components: [
                        {
                            type: 18, 
                            label: "Qual o seu passaporte na cidade?",
                            component: {
                                type: 4, custom_id: "rec_passaporte", style: 1, min_length: 1, max_length: 10, placeholder: "Ex: 1532", required: true
                            }
                        },
                        {
                            type: 18, 
                            label: "Qual sua experiência no crime?",
                            description: "Manda o papo reto do seu histórico.",
                            component: {
                                type: 4, custom_id: "rec_experiencia", style: 2, min_length: 20, max_length: 1000, placeholder: "Já rodei por 157...", required: true
                            }
                        }
                    ]
                }
            };
            return interaction.showModal(modalPayload.data);
        }
    }

    // ==========================================
    // SALVANDO CONFIGURAÇÕES (SELECT MENUS DO SUBMÓDULO)
    // ==========================================
    if (interaction.isAnySelectMenu()) {
        const guildId = interaction.guildId;

        if (interaction.customId === 'config_select_canal_rh') {
            const canalRhId = interaction.values[0];
            await pool.query(`
                INSERT INTO server_config (guild_id, canal_rh_id) 
                VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_rh_id = $2
            `, [guildId, canalRhId]);

            return interaction.reply({ content: `✅ Canal de RH setado pra <#${canalRhId}>.`, ephemeral: true });
        }

        if (interaction.customId === 'config_select_cargo_novato') {
            const cargoId = interaction.values[0];
            await pool.query(`
                INSERT INTO server_config (guild_id, cargo_aprovado_id) 
                VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET cargo_aprovado_id = $2
            `, [guildId, cargoId]); // Obs: Lembra de adicionar cargo_aprovado_id na tabela do banco!

            return interaction.reply({ content: `✅ Cargo de aprovado setado pra <@&${cargoId}>.`, ephemeral: true });
        }
    }
};
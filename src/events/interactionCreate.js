// src/events/interactionCreate.js
const { pool } = require('../database/db');
const { Routes } = require('discord.js');

module.exports = async (client, interaction) => {

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('[ERRO] B.O ao executar o comando:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Deu ruim ao puxar esse comando.', ephemeral: true });
            }
        }
        return;
    }

    if (interaction.isButton()) {
        const { customId } = interaction;

        // --- GESTÃO CLICOU PARA EXPLORAR O RH ---
        if (customId === 'btn_modulo_recrutamento') {
            const subModuloRH = [
                {
                    type: 17, // Container
                    accent_color: 16711680,
                    components: [
                        {
                            type: 10,
                            content: "# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure a base do seu RH e a identidade da facção. Selecione o canal onde as fichas vão cair e drope o painel na rua."
                        },
                        {
                            type: 1, 
                            components: [{ type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Onde as fichas do RH vão cair?", channel_types: [0] }]
                        },
                        {
                            type: 1, 
                            components: [{ type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Qual cargo o novato aprovado recebe?" }]
                        },
                        {
                            type: 1, 
                            components: [
                                { type: 2, style: 1, custom_id: "btn_config_nome_fac", label: "Renomear Facção", emoji: { name: "🏷️" } },
                                { type: 2, style: 2, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel Público", emoji: { name: "📦" } },
                                { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                            ]
                        }
                    ]
                }
            ];

            try {
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32832, components: subModuloRH } }
                });
            } catch (error) { console.error('[ERRO REST] Falha ao abrir RH:', error); }
            return;
        }

        // --- GESTÃO QUER RENOMEAR A FACÇÃO (MODAL) ---
        if (customId === 'btn_config_nome_fac') {
            const modalFac = {
                type: 9,
                data: {
                    custom_id: "modal_nome_fac",
                    title: "Identidade da Facção",
                    components: [
                        { type: 18, label: "Qual o nome da sua organização?", component: { type: 4, custom_id: "input_nome_fac", style: 1, min_length: 2, max_length: 50, placeholder: "Ex: Tropa da Koda", required: true } }
                    ]
                }
            };
            return interaction.showModal(modalFac.data);
        }

        // --- // --- GESTÃO CLICOU EM VOLTAR AO MENU PRINCIPAL ---
        if (customId === 'btn_voltar_menu_principal') {
            const payloadOriginal = [
                {
                    type: 17,
                    accent_color: 16711680,
                    components: [
                        { type: 12, items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] },
                        { type: 10, content: "# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`" },
                        { type: 14, spacing: 1, divider: true },
                        
                        {
                            type: 9,
                            components: [{ type: 10, content: "### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH." }],
                            accessory: { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar" }
                        },
                        {
                            type: 9,
                            components: [{ type: 10, content: "### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2." }],
                            accessory: { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar" }
                        },
                        {
                            type: 9,
                            components: [{ type: 10, content: "### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP." }],
                            accessory: { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar" }
                        },
                        
                        { type: 14, spacing: 1, divider: true },
                        { type: 1, components: [
                            { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                            { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                            { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } }
                        ]},
                        { type: 1, components: [
                            { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                        ]},
                        { type: 10, content: "*KODA STUDIOS | #Tropa • 25/07/2026*" }
                    ]
                }
            ];

            try {
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32832, components: payloadOriginal } }
                });
            } catch (error) { console.error('[ERRO REST] Falha ao voltar menu:', error); }
            return;
        }

        // --- GESTÃO DROPANDO O PAINEL DE RECRUTAMENTO NA RUA ---
        if (customId === 'btn_dropar_painel_rec') {
            try {
                const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';

                const painelPublico = [
                    {
                        type: 17,
                        accent_color: 16711680,
                        components: [
                            { type: 10, content: `# 📝 Recrutamento | ${nomeFac}\nVisão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho. Não adianta floodar.` },
                            { type: 1, components: [
                                { type: 2, style: 3, custom_id: "btn_abrir_modal_novato", label: "Preencher Ficha", emoji: { name: "✍️" } }
                            ]}
                        ]
                    }
                ];
                
                await client.rest.post(Routes.channelMessages(interaction.channelId), {
                    body: { flags: 32768, components: painelPublico }
                });
                await interaction.reply({ content: 'Painel dropado com sucesso nesse canal, chefe!', ephemeral: true });
            } catch (error) { console.error('[ERRO REST] Falha ao dropar painel:', error); }
            return;
        }

        // --- NOVATO ABRE MODAL ---
        if (customId === 'btn_abrir_modal_novato') {
            const modalPayload = {
                type: 9, 
                data: {
                    custom_id: "modal_recrutamento_form",
                    title: "Ficha de Recrutamento",
                    components: [
                        { type: 18, label: "Qual o seu passaporte na cidade?", component: { type: 4, custom_id: "rec_passaporte", style: 1, min_length: 1, max_length: 10, required: true } },
                        { type: 18, label: "Qual sua experiência no crime?", component: { type: 4, custom_id: "rec_experiencia", style: 2, min_length: 20, max_length: 1000, required: true } }
                    ]
                }
            };
            return interaction.showModal(modalPayload.data);
        }

        // --- RH APROVA ---
        if (customId.startsWith('btn_aprovar_')) {
            const targetUserId = customId.split('_')[2];
            try {
                await pool.query("UPDATE recrutamento SET status = 'aprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                const updatePayload = [{ type: 17, accent_color: 65280, components: [{ type: 10, content: `# ✅ Ficha Aprovada!\nA ficha do <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.` }] }];
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), { body: { type: 7, data: { flags: 32768, components: updatePayload } } });

                const config = await pool.query('SELECT cargo_aprovado_id, nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                
                if (member) {
                    if (config.rows[0]?.cargo_aprovado_id) await member.roles.add(config.rows[0].cargo_aprovado_id).catch(() => null);
                    await member.send(`Visão! Sua ficha para a **${config.rows[0]?.nome_faccao || 'Firma'}** foi **APROVADA**. Cola na base.`).catch(() => null);
                }
            } catch (error) { console.error('[ERRO]', error); }
            return;
        }

        // --- RH REPROVA ---
        if (customId.startsWith('btn_reprovar_')) {
            const targetUserId = customId.split('_')[2];
            try {
                await pool.query("UPDATE recrutamento SET status = 'reprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                const updatePayload = [{ type: 17, accent_color: 16711680, components: [{ type: 10, content: `# ❌ Ficha Recusada\nA ficha do <@${targetUserId}> foi pro lixo por <@${interaction.user.id}>.` }] }];
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), { body: { type: 7, data: { flags: 32768, components: updatePayload } } });

                const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                if (member) await member.send(`Sua ficha para a **${config.rows[0]?.nome_faccao || 'Firma'}** foi **REPROVADA**.`).catch(() => null);
            } catch (error) { console.error('[ERRO]', error); }
            return;
        }
    }

    // ==========================================
    // SALVANDO CONFIGURAÇÕES (SELECT MENUS)
    // ==========================================
    if (interaction.isAnySelectMenu()) {
        const guildId = interaction.guildId;
        if (interaction.customId === 'config_select_canal_rh') {
            await pool.query(`INSERT INTO server_config (guild_id, canal_rh_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_rh_id = $2`, [guildId, interaction.values[0]]);
            return interaction.reply({ content: `✅ Canal de RH setado pra <#${interaction.values[0]}>.`, ephemeral: true });
        }
        if (interaction.customId === 'config_select_cargo_novato') {
            await pool.query(`INSERT INTO server_config (guild_id, cargo_aprovado_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET cargo_aprovado_id = $2`, [guildId, interaction.values[0]]);
            return interaction.reply({ content: `✅ Cargo de aprovado setado pra <@&${interaction.values[0]}>.`, ephemeral: true });
        }
    }

    // ==========================================
    // TRATAMENTO DOS MODALS (FORMULÁRIOS)
    // ==========================================
    if (interaction.isModalSubmit()) {
        const guildId = interaction.guildId;

        if (interaction.customId === 'modal_nome_fac') {
            const novoNome = interaction.fields.getTextInputValue('input_nome_fac');
            await pool.query(`INSERT INTO server_config (guild_id, nome_faccao) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET nome_faccao = $2`, [guildId, novoNome]);
            return interaction.reply({ content: `✅ Identidade visual atualizada! O bot vai chamar sua firma de **${novoNome}**.`, ephemeral: true });
        }

        if (interaction.customId === 'modal_recrutamento_form') {
            const passaporte = interaction.fields.getTextInputValue('rec_passaporte');
            const experiencia = interaction.fields.getTextInputValue('rec_experiencia');
            
            try {
                const config = await pool.query('SELECT canal_rh_id FROM server_config WHERE guild_id = $1', [guildId]);
                if (!config.rows[0]?.canal_rh_id) return interaction.reply({ content: 'RH não configurado!', ephemeral: true });

                await pool.query('INSERT INTO recrutamento (guild_id, user_id, passaporte, experiencia) VALUES ($1, $2, $3, $4)', [guildId, interaction.user.id, passaporte, experiencia]);
                await interaction.reply({ content: `Ficha de \`${passaporte}\` enviada.`, ephemeral: true });

                const hrPayload = [
                    {
                        type: 17,
                        accent_color: 16753920,
                        components: [
                            { type: 10, content: `# 📋 Nova Ficha na Mesa!\n**Discord:** <@${interaction.user.id}>\n**Passaporte:** \`${passaporte}\`\n\n### 📝 Histórico:\n> ${experiencia}` },
                            { type: 1, components: [
                                { type: 2, style: 3, custom_id: `btn_aprovar_${interaction.user.id}`, label: "Aprovar", emoji: { name: "✅" } },
                                { type: 2, style: 4, custom_id: `btn_reprovar_${interaction.user.id}`, label: "Reprovar", emoji: { name: "❌" } }
                            ]}
                        ]
                    }
                ];
                
                await client.rest.post(Routes.channelMessages(config.rows[0].canal_rh_id), {
                    body: { flags: 32768, components: hrPayload }
                });
            } catch (error) { console.error('[ERRO]', error); }
        }
    }
};
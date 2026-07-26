// src/events/interactionCreate.js
const { pool } = require('../database/db');

module.exports = async (client, interaction) => {

    // ==========================================
    // 1. TRATAMENTO DE COMANDOS DE BARRA (SLASH)
    // ==========================================
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

    // ==========================================
    // 2. TRATAMENTO DE CLIQUES EM BOTÕES
    // ==========================================
    if (interaction.isButton()) {
        const { customId } = interaction;

        // --- GESTÃO CLICOU PARA EXPLORAR O RH ---
        if (customId === 'btn_modulo_recrutamento') {
            const embedRH = {
                color: 0xff0000,
                title: "📋 SUBMÓDULO: Gestão da Rapaziada",
                description: "Configure a base do seu RH e a identidade da facção."
            };

            const componentesRH = [
                { type: 1, components: [{ type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Onde as fichas do RH vão cair?", channel_types: [0] }] },
                { type: 1, components: [{ type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Qual cargo o novato aprovado recebe?" }] },
                { 
                    type: 1, 
                    components: [
                        { type: 2, style: 1, custom_id: "btn_config_nome_fac", label: "Renomear Facção", emoji: { name: "🏷️" } },
                        { type: 2, style: 2, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel", emoji: { name: "📦" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar", emoji: { name: "🔙" } }
                    ]
                }
            ];

            try {
                await interaction.update({ embeds: [embedRH], components: componentesRH });
            } catch (error) { console.error('[ERRO] Falha ao abrir RH:', error); }
            return;
        }

        // --- GESTÃO QUER RENOMEAR A FACÇÃO ---
        if (customId === 'btn_config_nome_fac') {
            const modalFac = {
                type: 9,
                data: {
                    custom_id: "modal_nome_fac",
                    title: "Identidade da Facção",
                    components: [
                        {
                            type: 18, 
                            label: "Qual o nome da sua organização?",
                            component: { type: 4, custom_id: "input_nome_fac", style: 1, min_length: 2, max_length: 50, placeholder: "Ex: Tropa do Koda, TCP, PCC...", required: true }
                        }
                    ]
                }
            };
            return interaction.showModal(modalFac.data);
        }

        // --- GESTÃO CLICOU EM VOLTAR AO MENU PRINCIPAL ---
        if (customId === 'btn_voltar_menu_principal') {
            const embedPrincipal = {
                color: 0xff0000,
                image: { url: "https://i.imgur.com/kS9wTqN.png" }, // Link do seu banner
                title: "💼 QG DO PATRÃO | Central de Gestão",
                description: "Visão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`",
                fields: [
                    { name: "📋 Gestão da Rapaziada", value: "Recrutamento, Ponto, Metas de Farm e RH.", inline: false },
                    { name: "🔫 Arsenal & Baú 💎", value: "`[REQUER VIP]` Auditoria de estoque e caixa 2.", inline: false },
                    { name: "⚖️ Tribunal do Crime", value: "Sistema de multas, cobranças, strikes e XP.", inline: false }
                ],
                footer: { text: "KODA STUDIOS | #Tropa • 25/07/2026" }
            };

            const componentesPrincipais = [
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
                        { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } }
                    ]
                },
                {
                    type: 1, 
                    components: [
                        { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                    ]
                }
            ];

            try {
                await interaction.update({ embeds: [embedPrincipal], components: componentesPrincipais });
            } catch (error) { console.error('[ERRO] Falha ao voltar menu:', error); }
            return;
        }

        // --- GESTÃO DROPANDO O PAINEL DE RECRUTAMENTO NA RUA ---
        if (customId === 'btn_dropar_painel_rec') {
            try {
                const guildId = interaction.guildId;
                // Puxa o nome da facção do banco de dados
                const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
                const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';

                const embedPublico = {
                    color: 0xff0000,
                    title: `📝 Recrutamento | ${nomeFac}`,
                    description: "Visão, novato. Quer fechar com o certo? Clica no botão abaixo, manda tua ficha pro nosso RH e aguarda o radinho. Não adianta floodar.",
                    footer: { text: "Sistema de Recrutamento" }
                };

                const componentesPublico = [
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 3, custom_id: "btn_abrir_modal_novato", label: "Preencher Ficha", emoji: { name: "✍️" } }
                        ]
                    }
                ];
                
                // Envia a mensagem pro canal onde a gestão clicou
                await interaction.channel.send({ embeds: [embedPublico], components: componentesPublico });
                await interaction.reply({ content: 'Painel dropado com sucesso nesse canal, chefe!', ephemeral: true });
            } catch (error) {
                console.error('[ERRO] Falha ao dropar painel público:', error);
            }
            return;
        }

        // --- NOVATO CLICANDO NO PAINEL PÚBLICO (ABRE O MODAL) ---
        if (customId === 'btn_abrir_modal_novato') {
            const modalPayload = {
                type: 9, 
                data: {
                    custom_id: "modal_recrutamento_form",
                    title: "Ficha de Recrutamento",
                    components: [
                        { type: 18, label: "Qual o seu passaporte na cidade?", component: { type: 4, custom_id: "rec_passaporte", style: 1, min_length: 1, max_length: 10, placeholder: "Ex: 1532", required: true } },
                        { type: 18, label: "Qual sua experiência no crime?", component: { type: 4, custom_id: "rec_experiencia", style: 2, min_length: 20, max_length: 1000, placeholder: "Já rodei por 157...", required: true } }
                    ]
                }
            };
            return interaction.showModal(modalPayload.data);
        }

        // --- RH APROVANDO O CRIA ---
        if (customId.startsWith('btn_aprovar_')) {
            const targetUserId = customId.split('_')[2];
            try {
                await pool.query("UPDATE recrutamento SET status = 'aprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                const embedAprovado = {
                    color: 0x00ff00,
                    title: "✅ Ficha Aprovada!",
                    description: `A ficha do <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.`
                };
                
                await interaction.update({ embeds: [embedAprovado], components: [] });

                // Puxa o cargo e o nome da facção
                const config = await pool.query('SELECT cargo_aprovado_id, nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const cargoId = config.rows[0]?.cargo_aprovado_id;
                const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                
                if (member) {
                    if (cargoId) await member.roles.add(cargoId).catch(() => console.log('[AVISO] Sem permissão para dar o cargo.'));
                    await member.send(`Visão! Sua ficha para a **${nomeFac}** foi **APROVADA** pelo RH. Cola na base pra pegar o radinho e o kit iniciante.`).catch(() => null);
                }
            } catch (error) { console.error('[ERRO] Falha ao aprovar novato:', error); }
            return;
        }

        // --- RH MANDANDO RALAR (REPROVANDO) ---
        if (customId.startsWith('btn_reprovar_')) {
            const targetUserId = customId.split('_')[2];
            try {
                await pool.query("UPDATE recrutamento SET status = 'reprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                const embedReprovado = {
                    color: 0xff0000,
                    title: "❌ Ficha Recusada",
                    description: `A ficha do <@${targetUserId}> foi mandada pro lixo por <@${interaction.user.id}>.`
                };
                
                await interaction.update({ embeds: [embedReprovado], components: [] });

                const config = await pool.query('SELECT nome_faccao FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);

                if (member) {
                    await member.send(`Foi mal, chefe. Sua ficha para a **${nomeFac}** foi **REPROVADA** pela diretoria. Tenta de novo na próxima leva.`).catch(() => null);
                }
            } catch (error) { console.error('[ERRO] Falha ao reprovar novato:', error); }
            return;
        }
    }

    // ==========================================
    // 3. SALVANDO CONFIGURAÇÕES (SELECT MENUS)
    // ==========================================
    if (interaction.isAnySelectMenu()) {
        const guildId = interaction.guildId;

        if (interaction.customId === 'config_select_canal_rh') {
            const canalRhId = interaction.values[0];
            await pool.query(`INSERT INTO server_config (guild_id, canal_rh_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET canal_rh_id = $2`, [guildId, canalRhId]);
            return interaction.reply({ content: `✅ Canal de RH setado pra <#${canalRhId}>.`, ephemeral: true });
        }

        if (interaction.customId === 'config_select_cargo_novato') {
            const cargoId = interaction.values[0];
            await pool.query(`INSERT INTO server_config (guild_id, cargo_aprovado_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET cargo_aprovado_id = $2`, [guildId, cargoId]);
            return interaction.reply({ content: `✅ Cargo de aprovado setado pra <@&${cargoId}>.`, ephemeral: true });
        }
    }

    // ==========================================
    // 4. TRATAMENTO DOS MODALS (FORMULÁRIOS)
    // ==========================================
    if (interaction.isModalSubmit()) {
        const guildId = interaction.guildId;

        // --- FORMULÁRIO DE NOME DA FACÇÃO ---
        if (interaction.customId === 'modal_nome_fac') {
            const novoNome = interaction.fields.getTextInputValue('input_nome_fac');
            try {
                await pool.query(`INSERT INTO server_config (guild_id, nome_faccao) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET nome_faccao = $2`, [guildId, novoNome]);
                return interaction.reply({ content: `✅ Identidade visual atualizada! O bot agora vai chamar sua firma de **${novoNome}**.`, ephemeral: true });
            } catch (error) {
                console.error('[ERRO] Falha ao salvar nome da facção:', error);
            }
            return;
        }

        // --- FORMULÁRIO DE RECRUTAMENTO DO NOVATO ---
        if (interaction.customId === 'modal_recrutamento_form') {
            const passaporte = interaction.fields.getTextInputValue('rec_passaporte');
            const experiencia = interaction.fields.getTextInputValue('rec_experiencia');
            const userId = interaction.user.id;
            
            try {
                const config = await pool.query('SELECT canal_rh_id FROM server_config WHERE guild_id = $1', [guildId]);
                const canalRhId = config.rows[0]?.canal_rh_id;

                if (!canalRhId) {
                    return interaction.reply({ content: 'Visão, a gestão ainda não configurou o canal do RH nesse servidor. Avisa os cara lá!', ephemeral: true });
                }

                await pool.query('INSERT INTO recrutamento (guild_id, user_id, passaporte, experiencia) VALUES ($1, $2, $3, $4)', [guildId, userId, passaporte, experiencia]);
                await interaction.reply({ content: `Passaporte \`${passaporte}\` registrado, cria. Aguarda o radinho.`, ephemeral: true });

                const embedFicha = {
                    color: 0xffaa00,
                    title: "📋 Nova Ficha na Mesa!",
                    description: `**Discord:** <@${userId}>\n**Passaporte:** \`${passaporte}\`\n\n**📝 Histórico no Crime:**\n> ${experiencia}`
                };

                const componentesFicha = [
                    { type: 1, components: [
                        { type: 2, style: 3, custom_id: `btn_aprovar_${userId}`, label: "Aprovar", emoji: { name: "✅" } },
                        { type: 2, style: 4, custom_id: `btn_reprovar_${userId}`, label: "Reprovar", emoji: { name: "❌" } }
                    ]}
                ];
                
                const canalRH = client.channels.cache.get(canalRhId);
                if (canalRH) {
                    await canalRH.send({ embeds: [embedFicha], components: componentesFicha });
                }
            } catch (error) {
                console.error('[ERRO] Falha ao processar recrutamento:', error);
            }
        }
    }
};
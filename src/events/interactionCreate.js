// src/events/interactionCreate.js
const { pool } = require('../database/db');
const { Routes } = require('discord.js');

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
            const subModuloRH = [
                {
                    type: 10,
                    content: "# 📋 SUBMÓDULO: Gestão da Rapaziada\nConfigure a base do seu RH. Selecione o canal onde as fichas vão cair para aprovação e, quando tiver tudo pronto, drope o painel na rua pros novatos preencherem."
                },
                {
                    type: 1, 
                    components: [
                        { type: 8, custom_id: "config_select_canal_rh", placeholder: "1. Onde as fichas do RH vão cair?", channel_types: [0] }
                    ]
                },
                {
                    type: 1, 
                    components: [
                        { type: 6, custom_id: "config_select_cargo_novato", placeholder: "2. Qual cargo o novato aprovado recebe?" }
                    ]
                },
                {
                    type: 1, 
                    components: [
                        { type: 2, style: 1, custom_id: "btn_dropar_painel_rec", label: "Dropar Painel Público", emoji: { name: "📦" } },
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                }
            ];

            try {
                // Type 7 = Update Message
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32832, components: subModuloRH } }
                });
            } catch (error) { console.error('[ERRO REST] Falha ao abrir RH:', error); }
            return;
        }

        // --- GESTÃO CLICOU EM VOLTAR AO MENU PRINCIPAL ---
        if (customId === 'btn_voltar_menu_principal') {
            const payloadOriginal = [
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
            const painelPublico = [
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
            ];
            
            try {
                // Envia a mensagem V2 direto pro canal
                await client.rest.post(Routes.channelMessages(interaction.channelId), {
                    body: { flags: 32768, components: painelPublico }
                });
                await interaction.reply({ content: 'Painel dropado com sucesso nesse canal, chefe!', ephemeral: true });
            } catch (error) {
                console.error('[ERRO REST] Falha ao dropar painel público:', error);
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

                // Atualiza a ficha tirando os botões via REST
                const updatePayload = [
                    { type: 10, content: `# ✅ Ficha Aprovada!\nA ficha do <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.` }
                ];
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32768, components: updatePayload } }
                });

                // Tenta puxar o cargo configurado e dar pro membro
                const config = await pool.query('SELECT cargo_aprovado_id FROM server_config WHERE guild_id = $1', [interaction.guildId]);
                const cargoId = config.rows[0]?.cargo_aprovado_id;
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                
                if (member) {
                    if (cargoId) await member.roles.add(cargoId).catch(() => console.log('[AVISO] Sem permissão para dar o cargo.'));
                    await member.send('Visão! Sua ficha foi **APROVADA** pelo RH da facção. Cola na base pra pegar o radinho e o kit iniciante.').catch(() => null);
                }
            } catch (error) { console.error('[ERRO] Falha ao aprovar novato:', error); }
            return;
        }

        // --- RH MANDANDO RALAR (REPROVANDO) ---
        if (customId.startsWith('btn_reprovar_')) {
            const targetUserId = customId.split('_')[2];
            try {
                await pool.query("UPDATE recrutamento SET status = 'reprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                const updatePayload = [
                    { type: 10, content: `# ❌ Ficha Recusada.\nA ficha do <@${targetUserId}> foi mandada pro lixo por <@${interaction.user.id}>.` }
                ];
                await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: { type: 7, data: { flags: 32768, components: updatePayload } }
                });

                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                if (member) {
                    await member.send('Foi mal, chefe. Sua ficha foi **REPROVADA** pela diretoria. Tenta de novo na próxima leva.').catch(() => null);
                }
            } catch (error) { console.error('[ERRO] Falha ao reprovar novato:', error); }
            return;
        }
    }

    // ==========================================
    // 3. SALVANDO CONFIGURAÇÕES (SELECT MENUS DO SUBMÓDULO)
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
    // 4. TRATAMENTO DO ENVIO DE MODAL (FORMULÁRIO)
    // ==========================================
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_recrutamento_form') {
            const passaporte = interaction.fields.getTextInputValue('rec_passaporte');
            const experiencia = interaction.fields.getTextInputValue('rec_experiencia');
            const userId = interaction.user.id;
            const guildId = interaction.guildId;
            
            try {
                // Puxa o canal de RH do banco
                const config = await pool.query('SELECT canal_rh_id FROM server_config WHERE guild_id = $1', [guildId]);
                const canalRhId = config.rows[0]?.canal_rh_id;

                if (!canalRhId) {
                    return interaction.reply({ content: 'Visão, a gestão ainda não configurou o canal do RH nesse servidor. Avisa os cara lá!', ephemeral: true });
                }

                // Salva a ficha
                await pool.query('INSERT INTO recrutamento (guild_id, user_id, passaporte, experiencia) VALUES ($1, $2, $3, $4)', [guildId, userId, passaporte, experiencia]);
                await interaction.reply({ content: `Passaporte \`${passaporte}\` registrado, cria. Aguarda o radinho.`, ephemeral: true });

                // Manda pro canal de RH via REST (Bypass)
                const hrPayload = [
                    { type: 10, content: `# 📋 Nova Ficha na Mesa!\n**Discord:** <@${userId}>\n**Passaporte:** \`${passaporte}\`\n\n### 📝 Histórico no Crime:\n> ${experiencia}` },
                    { type: 1, components: [
                        { type: 2, style: 3, custom_id: `btn_aprovar_${userId}`, label: "Aprovar", emoji: { name: "✅" } },
                        { type: 2, style: 4, custom_id: `btn_reprovar_${userId}`, label: "Reprovar", emoji: { name: "❌" } }
                    ]}
                ];
                
                await client.rest.post(Routes.channelMessages(canalRhId), {
                    body: { flags: 32768, components: hrPayload }
                });

            } catch (error) {
                console.error('[ERRO REST] Falha ao processar recrutamento:', error);
            }
        }
    }
};
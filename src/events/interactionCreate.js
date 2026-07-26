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
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Deu ruim ao puxar esse comando, avisa a gestão.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Deu ruim ao puxar esse comando, avisa a gestão.', ephemeral: true });
            }
        }
        return; // Retorna pra não conflitar com os debaixo
    }

    // ==========================================
    // 2. TRATAMENTO DE CLIQUES EM BOTÕES (V2)
    // ==========================================
    if (interaction.isButton()) {
        const { customId } = interaction;

        // --- BOTÃO DO PAINEL PRINCIPAL: EXPLORAR GESTÃO (RECRUTAMENTO) ---
        if (customId === 'btn_modulo_recrutamento') {
            const modalPayload = {
                type: 9, // Aciona o MODAL
                data: {
                    custom_id: "modal_recrutamento_form",
                    title: "Ficha de Recrutamento",
                    components: [
                        {
                            type: 18, // Label
                            label: "Qual o seu passaporte na cidade?",
                            component: {
                                type: 4, // Input de texto
                                custom_id: "rec_passaporte",
                                style: 1, // Curto
                                min_length: 1,
                                max_length: 10,
                                placeholder: "Ex: 1532",
                                required: true
                            }
                        },
                        {
                            type: 18, 
                            label: "Qual sua experiência no crime?",
                            description: "Manda o papo reto do seu histórico.",
                            component: {
                                type: 4, 
                                custom_id: "rec_experiencia",
                                style: 2, // Parágrafo longo
                                min_length: 20,
                                max_length: 1000,
                                placeholder: "Já rodei por 157, vim da facção X, sou bom de tiro...",
                                required: true
                            }
                        }
                    ]
                }
            };
            return interaction.showModal(modalPayload.data);
        }

        // --- BOTÃO DO RH: APROVAR CRIA ---
        if (customId.startsWith('btn_aprovar_')) {
            const targetUserId = customId.split('_')[2]; // Pega o ID que a gente atrelou no botão

            try {
                // Atualiza o banco de dados
                await pool.query("UPDATE recrutamento SET status = 'aprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                // Edita a mensagem do RH (Muda pra texto e tira os botões)
                const updatePayload = {
                    flags: 32768,
                    components: [
                        {
                            type: 10,
                            content: `# ✅ Ficha Aprovada!\nA ficha do <@${targetUserId}> foi aprovada por <@${interaction.user.id}>.`
                        }
                    ]
                };
                await interaction.update(updatePayload);

                // Manda DM pro cara
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                if (member) {
                    await member.send('Visão! Sua ficha foi **APROVADA** pelo RH da facção. Cola na base pra pegar o radinho e o kit iniciante.').catch(() => console.log(`[AVISO] DM fechada do user ${targetUserId}`));
                }
            } catch (error) {
                console.error('[ERRO] Falha ao aprovar novato:', error);
            }
            return;
        }

        // --- BOTÃO DO RH: MANDAR RALAR (REPROVAR) ---
        if (customId.startsWith('btn_reprovar_')) {
            const targetUserId = customId.split('_')[2];

            try {
                // Atualiza o banco de dados
                await pool.query("UPDATE recrutamento SET status = 'reprovado' WHERE user_id = $1 AND status = 'pendente'", [targetUserId]);

                // Edita a mensagem do RH
                const updatePayload = {
                    flags: 32768,
                    components: [
                        {
                            type: 10,
                            content: `# ❌ Ficha Recusada.\nA ficha do <@${targetUserId}> foi mandada pro lixo por <@${interaction.user.id}>.`
                        }
                    ]
                };
                await interaction.update(updatePayload);

                // Manda DM pro cara
                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
                if (member) {
                    await member.send('Foi mal, chefe. Sua ficha foi **REPROVADA** pela diretoria. Tenta de novo na próxima leva.').catch(() => null);
                }
            } catch (error) {
                console.error('[ERRO] Falha ao reprovar novato:', error);
            }
            return;
        }
    }

    // ==========================================
    // 3. TRATAMENTO DO ENVIO DE MODAL (FORMULÁRIO)
    // ==========================================
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_recrutamento_form') {
            const passaporte = interaction.fields.getTextInputValue('rec_passaporte');
            const experiencia = interaction.fields.getTextInputValue('rec_experiencia');
            const userId = interaction.user.id;
            
            try {
                // Salva no PostgreSQL
                await pool.query(
                    'INSERT INTO recrutamento (user_id, passaporte, experiencia) VALUES ($1, $2, $3)',
                    [userId, passaporte, experiencia]
                );

                // Confirma pro usuário na mesma hora
                await interaction.reply({ 
                    content: `Visão, <@${userId}>! Passaporte \`${passaporte}\` registrado no sistema. Aguarda a avaliação da diretoria.`, 
                    ephemeral: true 
                });

                // Manda pro canal de RH
                const canalRH = client.channels.cache.get(process.env.CANAL_RH_ID); 
                
                if (canalRH) {
                    const hrPayload = {
                        flags: 32768, // V2 puro
                        components: [
                            {
                                type: 10, // Text Display
                                content: `# 📋 Nova Ficha na Mesa!\n**Discord:** <@${userId}>\n**Passaporte:** \`${passaporte}\`\n\n### 📝 Histórico no Crime:\n> ${experiencia}`
                            },
                            {
                                type: 1, // Action Row (Botões)
                                components: [
                                    { type: 2, style: 3, custom_id: `btn_aprovar_${userId}`, label: "Aprovar Cria", emoji: { name: "✅" } },
                                    { type: 2, style: 4, custom_id: `btn_reprovar_${userId}`, label: "Mandar Ralar", emoji: { name: "❌" } }
                                ]
                            }
                        ]
                    };
                    await canalRH.send(hrPayload);
                }
            } catch (error) {
                console.error('[ERRO] Falha ao injetar recrutamento no banco:', error);
                await interaction.reply({ content: 'Deu b.o no sistema de dados. Tenta mandar a ficha de novo depois.', ephemeral: true });
            }
        }
    }
};
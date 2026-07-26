// src/commands/painel/kodafive.js
const { Routes } = require('discord.js');
const { pool } = require('../../database/db'); // Importando o banco de dados

module.exports = {
    name: 'kodafive',
    description: '[GESTÃO] Abre a central de controle da facção',
    async execute(interaction) {
        // Trava de segurança: só Admin ou o DEV conseguem abrir
        const isGestao = interaction.member?.permissions.has('Administrator');
        const isDev = interaction.user.id === process.env.DEV_ID;

        if (!isGestao && !isDev) {
            return interaction.reply({ 
                content: 'Sai pra lá, Zé Polvinho. Isso aqui é o QG do Patrão, acesso restrito.', 
                flags: 64 // ephemeral nativo sem aviso no console
            });
        }
        
        console.log(`[SISTEMA] O chefia ${interaction.user.tag} puxou o painel nativo /kodafive`);

        // --- LÓGICA VIP (Checagem em tempo real na abertura do comando) ---
        const config = await pool.query('SELECT is_vip FROM server_config WHERE guild_id = $1', [interaction.guildId]);
        const isVip = config.rows[0]?.is_vip || false;
        
        const statusTexto = isVip ? '`Plano Patrão (VIP) 💎`' : '`Plano Cria (Grátis)`';

        // JSON Bruto - Design Premium com Botões em Linha (Sections)
        const componentsV2 = [
            {
                type: 17, // Container principal (borda lateral)
                accent_color: 16711680, // Vermelho Koda
                components: [
                    {
                        type: 12, // Banner no topo
                        items: [{ media: { url: "https://i.ibb.co/68037k9/banner-placeholder.png" } }] // Substitua pelo link direto do seu banner
                    },
                    {
                        type: 10, // Cabeçalho com o status dinâmico
                        content: `# 💼 QG DO PATRÃO | Central de Gestão\nVisão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** ${statusTexto}`
                    },
                    { type: 14, spacing: 1, divider: true }, // Separador de linha fina
                    
                    // --- MÓDULO 1: GESTÃO ---
                    {
                        type: 9, // Section (Texto na esquerda, Botão na direita)
                        components: [
                            { type: 10, content: "### 📋 Gestão da Rapaziada\nRecrutamento, Ponto, Metas de Farm e RH." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar" }
                    },
                    
                    // --- MÓDULO 2: ARSENAL ---
                    {
                        type: 9,
                        components: [
                            { type: 10, content: "### 🔫 Arsenal & Baú 💎\n`[REQUER VIP]` Auditoria de estoque e caixa 2." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar" }
                    },
                    
                    // --- MÓDULO 3: TRIBUNAL ---
                    {
                        type: 9,
                        components: [
                            { type: 10, content: "### ⚖️ Tribunal do Crime\nSistema de multas, cobranças, strikes e XP." }
                        ],
                        accessory: { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar" }
                    },
                    
                    { type: 14, spacing: 1, divider: true }, // Outro separador antes dos controles

                    // --- CONTROLES DE PÁGINA E VIP ---
                    {
                        type: 1, // ActionRow de paginação
                        components: [
                            { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                            { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                            { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } }
                        ]
                    },
                    {
                        type: 1, // ActionRow do botão VIP
                        components: [
                            { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                        ]
                    },
                    {
                        type: 10, // Rodapé atualizado no padrão
                        content: "💼 *KODA STUDIOS • Sistema de Gestão Inteligente*"
                    }
                ]
            }
        ];

        try {
            // Bypass REST para injetar o componente V2 com Ephemeral
            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 4, 
                        data: {
                            flags: 32832, // 32768 (V2) + 64 (Ephemeral)
                            components: componentsV2
                        }
                    }
                }
            );
        } catch (error) {
            console.error('[ERRO REST] Falha ao dropar o painel V2 Container:', error);
        }
    }
};
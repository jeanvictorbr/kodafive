// src/commands/painel/kodafive.js

module.exports = {
    name: 'kodafive',
    description: '[GESTÃO] Abre a central de controle da facção',
    async execute(interaction) {
        const isGestao = interaction.member?.permissions.has('Administrator');
        const isDev = interaction.user.id === process.env.DEV_ID;

        if (!isGestao && !isDev) {
            return interaction.reply({ 
                content: 'Sai pra lá, Zé Polvinho. Isso aqui é o QG do Patrão, acesso restrito.', 
                ephemeral: true 
            });
        }
        
        // Estrutura de Embed (Design Premium / App Nativo)
        const embedPrincipal = {
            color: 0xff0000, // Linha lateral vermelha
            image: {
                url: "https://i.imgur.com/kS9wTqN.png" // Substitua pelo link direto do seu banner
            },
            title: "💼 QG DO PATRÃO | Central de Gestão",
            description: "Visão, chefe! O que vamos adiantar hoje? Escolha a fita aí embaixo.\n\n**Status atual:** `Plano Cria (Grátis)`",
            fields: [
                { name: "📋 Gestão da Rapaziada", value: "Recrutamento, Ponto, Metas de Farm e RH.", inline: false },
                { name: "🔫 Arsenal & Baú 💎", value: "`[REQUER VIP]` Auditoria de estoque e caixa 2.", inline: false },
                { name: "⚖️ Tribunal do Crime", value: "Sistema de multas, cobranças, strikes e XP.", inline: false }
            ],
            footer: {
                text: "KODA STUDIOS | #Tropa • 25/07/2026" // Rodapé cinzinha profissional
            }
        };

        const componentes = [
            {
                type: 1, // Botoões de ação principais
                components: [
                    { type: 2, style: 2, custom_id: "btn_modulo_recrutamento", label: "Explorar Gestão", emoji: { name: "📋" } },
                    { type: 2, style: 2, custom_id: "btn_modulo_arsenal", label: "Explorar Arsenal", emoji: { name: "🔫" } },
                    { type: 2, style: 2, custom_id: "btn_modulo_tribunal", label: "Explorar Tribunal", emoji: { name: "⚖️" } }
                ]
            },
            {
                type: 1, // Botoões de Paginação
                components: [
                    { type: 2, style: 2, custom_id: "page_back", emoji: { name: "⬅️" } },
                    { type: 2, style: 2, custom_id: "page_indicator", label: "Página 1/2", disabled: true },
                    { type: 2, style: 2, custom_id: "page_next", emoji: { name: "➡️" } }
                ]
            },
            {
                type: 1, // Resgatar VIP
                components: [
                    { type: 2, style: 3, custom_id: "btn_resgatar_vip", label: "Resgatar Chave VIP", emoji: { name: "🔑" } }
                ]
            }
        ];

        // Usando o nativo do Discord.js agora que saímos do V2 purista
        await interaction.reply({
            embeds: [embedPrincipal],
            components: componentes,
            ephemeral: true
        });
    }
};
/**
 * Função para atualizar a vitrine de farm em tempo real usando Components V2
 * @param {import('discord.js').Client} client - O cliente do bot
 * @param {string} guildId - O ID do servidor (Facção/Cidade)
 */
async function atualizarVitrineFarm(client, guildId) {
    try {
        // 1. [SEU BANCO AQUI] Puxe os dados da meta atual e os IDs de onde a mensagem tá
        const dbFarm = {
            canalVitrineId: '123456789012345678', // Canal da vitrine
            mensagemVitrineId: '987654321098765432', // ID da mensagem do bot
            metaAtual: 150,
            metaTotal: 500,
            item: 'Pacotes',
            ciclo: 'Termina em 2 horas'
        };

        if (!dbFarm.canalVitrineId || !dbFarm.mensagemVitrineId) return;

        // 2. Busca a mensagem no cache ou na API
        const channel = client.channels.cache.get(dbFarm.canalVitrineId) || await client.channels.fetch(dbFarm.canalVitrineId);
        if (!channel) return;
        
        const message = channel.messages.cache.get(dbFarm.mensagemVitrineId) || await channel.messages.fetch(dbFarm.mensagemVitrineId);
        if (!message) return;

        // 3. Montando o Payload no Padrão V2 (Sem embeds!)
        const payloadV2 = {
            flags: 32768, // Ativa o modo Components V2
            components: [
                {
                    type: 17, // Container Component: abraça os outros itens
                    accent_color: 3092790, // Cor de destaque na lateral (estilo a cor do embed)
                    components: [
                        { 
                            type: 10, // TextDisplay: renderiza o texto em markdown
                            content: "## 🌿 | Progresso do Farm da Facção\n\nAcompanhe a cota atual da quebrada, tropa." 
                        },
                        { 
                            type: 14, // Separator: Linha divisória visual
                            spacing: 1, 
                            divider: true 
                        },
                        { 
                            type: 10, 
                            content: `**Meta Global:** \`${dbFarm.metaAtual} / ${dbFarm.metaTotal} ${dbFarm.item}\`\n**Status:** ${dbFarm.ciclo}` 
                        },
                        { 
                            type: 14, 
                            spacing: 2, 
                            divider: false // Apenas dá um espaço em branco antes dos botões
                        },
                        {
                            type: 1, // ActionRow: Segura os botões
                            components: [
                                {
                                    type: 2, // Botão
                                    style: 1, // Primary (Azul)
                                    label: "Meu Progresso",
                                    custom_id: "btn_ver_progresso_farm",
                                    emoji: { name: "🎒" } //
                                },
                                {
                                    type: 2,
                                    style: 2, // Secondary (Cinza)
                                    label: "Editar Meta (Líder)",
                                    custom_id: "btn_editar_farm",
                                    emoji: { name: "⚙️" }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        // 4. Edita a mensagem vitrine silenciosamente e na hora
        await message.edit(payloadV2);
        console.log('[SISTEMA] Vitrine do Farm sincronizada no padrão V2 com sucesso!');

    } catch (error) {
        console.error('[ERRO] Deu ruim ao atualizar a vitrine de farm:', error);
    }
}

module.exports = { atualizarVitrineFarm };
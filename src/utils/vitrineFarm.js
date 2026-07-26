// src/utils/vitrineFarm.js

/**
 * Função para atualizar a vitrine de farm em tempo real usando Components V2
 * @param {import('discord.js').Client} client - O cliente do bot
 * @param {string} guildId - O ID do servidor (Facção/Cidade)
 */
async function atualizarVitrineFarm(client, guildId) {
    try {
        // 1. [SEU BANCO AQUI] Puxe os dados da meta atual e os IDs de onde a mensagem da vitrine tá salva
        // Exemplo: const db = await pool.query('SELECT canal_vitrine, msg_vitrine, ... FROM configs WHERE guild_id = $1', [guildId]);
        
        // Simulação do banco (Altere para os seus dados reais)
        const dbFarm = {
            canalVitrineId: null, // Deixe null ou vazio no banco se a vitrine não foi dropada
            mensagemVitrineId: null, 
            metaAtual: 150,
            metaTotal: 500,
            item: 'Pacotes',
            ciclo: 'Termina em 2 horas'
        };

        // Se o banco retornar null/undefined pros IDs, a vitrine não existe. Sai da função quietinho.
        if (!dbFarm.canalVitrineId || !dbFarm.mensagemVitrineId || dbFarm.canalVitrineId === '123456789012345678') {
            return; 
        }

        // 2. Busca o canal de forma segura (Se der erro 10003, o canal não existe mais)
        let channel;
        try {
            channel = client.channels.cache.get(dbFarm.canalVitrineId) || await client.channels.fetch(dbFarm.canalVitrineId);
        } catch (err) {
            // Canal desconhecido (foi apagado ou o ID tá errado). Sai da função sem gerar erro no console.
            return; 
        }

        // 3. Busca a mensagem de forma segura (Se der erro 10008, a mensagem foi apagada)
        let message;
        try {
            message = channel.messages.cache.get(dbFarm.mensagemVitrineId) || await channel.messages.fetch(dbFarm.mensagemVitrineId);
        } catch (err) {
            // Mensagem desconhecida. Sai da função sem gerar erro.
            return;
        }

        // ====================================================================
        // SE CHEGOU AQUI, O CANAL E A MENSAGEM EXISTEM! VAMOS ATUALIZAR.
        // ====================================================================

        const payloadV2 = {
            flags: 32768, // Modo Components V2
            components: [
                {
                    type: 17, // Container Component
                    accent_color: 3092790, // Cor na lateral
                    components: [
                        { 
                            type: 10, // TextDisplay
                            content: "## 🌿 | Progresso do Farm da Facção\n\nAcompanhe a cota atual da quebrada, tropa." 
                        },
                        { 
                            type: 14, // Separator
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
                            divider: false
                        },
                        {
                            type: 1, // ActionRow (Botões)
                            components: [
                                {
                                    type: 2, 
                                    style: 1, 
                                    label: "Meu Progresso",
                                    custom_id: "btn_ver_progresso_farm",
                                    emoji: { name: "🎒" }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        // 4. Edita a mensagem vitrine na mesma hora
        await message.edit(payloadV2);
        console.log(`[SISTEMA] Vitrine do Farm (${guildId}) sincronizada no padrão V2 com sucesso!`);

    } catch (error) {
        // Se der algum erro muito louco que a gente não previu, ele loga aqui
        console.error('[ERRO CRÍTICO] Falha inesperada ao atualizar a vitrine de farm:', error);
    }
}

module.exports = { atualizarVitrineFarm };
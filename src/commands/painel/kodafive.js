// src/commands/painel/kodafive.js
const { Routes } = require('discord.js');
const { buildPainelQG } = require('../../utils/buildPainelQG');

module.exports = {
    name: 'kodafive',
    description: '[GESTÃO] Abre a central de controle da facção',
    async execute(interaction) {
        const isGestao = interaction.member?.permissions.has('Administrator');
        const isDev = interaction.user.id === process.env.DEV_ID;

        if (!isGestao && !isDev) {
            return interaction.reply({ 
                content: 'Sai pra lá, Zé Polvinho. Isso aqui é o QG do Patrão, acesso restrito.', 
                flags: 64
            });
        }
        
        console.log(`[SISTEMA] O chefia ${interaction.user.tag} puxou o painel nativo /kodafive`);

        try {
            const componentsV2 = await buildPainelQG(interaction);
            await interaction.client.rest.post(
                Routes.interactionCallback(interaction.id, interaction.token),
                {
                    body: {
                        type: 4, 
                        data: {
                            flags: 32832,
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
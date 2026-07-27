const { REST, Routes } = require('discord.js');
const { sendLogWebhook } = require('../../utils/webhookLogger');

module.exports = async (client) => {
    console.log(`[VISÃO] ${client.user.tag} tá online e roteando!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    const commands = [
        {
            name: 'kodafive',
            description: 'Abre o QG do Patrão | Central de Gestão'
        },
        {
            name: 'dev',
            description: '[DEV] Central de Controle do Bot'
        },

        {
            name: 'Dossiê',
            type: 2
        },
        {
            name: 'Aplicar Multa',
            type: 2
        },
        {
            name: 'Advertir',
            type: 2
        },
        {
            name: 'Suspender',
            type: 2
        }
    ];

    try {
        if (process.env.TEST_GUILD_ID) {
            console.log('[SISTEMA] Registrando comandos na guilda de testes...');
            await rest.put(
                Routes.applicationGuildCommands(process.env.APP_ID, process.env.TEST_GUILD_ID),
                { body: commands }
            );
        } else {
            console.log('[SISTEMA] Registrando comandos globalmente...');
            await rest.put(
                Routes.applicationCommands(process.env.APP_ID),
                { body: commands }
            );
        }
        console.log('[SISTEMA] Comandos registrados no capricho!');
    } catch (error) {
        console.error('[ERRO] Deu ruim ao registrar os comandos:', error);
    }

    const totalGuilds = client.guilds.cache.size;
    await sendLogWebhook({
        embeds: [{
            color: 4437377,
            title: '🟢 BOT INICIADO',
            fields: [
                { name: '🤖 Bot', value: `\`${client.user.tag}\``, inline: true },
                { name: '🌐 Servidores', value: `\`${totalGuilds}\``, inline: true },
                { name: '⏰ Início', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            ],
            footer: { text: `ID: ${client.user.id}` },
            timestamp: new Date().toISOString()
        }]
    });
};

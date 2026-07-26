// src/events/ready.js
const { REST, Routes } = require('discord.js');

module.exports = async (client) => {
    console.log(`[VISÃO] ${client.user.tag} tá online e roteando!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    // Simulação do array de comandos que você carregaria dinamicamente
    const commands = [
        {
            name: 'kodafive',
            description: 'Abre o QG do Patrão | Central de Gestão'
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
};
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { iniciarBanco } = require('./src/database/db.js');
const { iniciarSchedulerFarm } = require('./src/utils/farmScheduler');
const { iniciarSchedulerExpurgo } = require('./src/utils/expurgoScheduler');
const { iniciarSchedulerVip } = require('./src/utils/vipScheduler');

// Configurando o cliente inquebrável com os Intents necessários
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent // Pra ler palavras-chave do FAQ
    ]
});

// Criando a coleção pra guardar os comandos em memória
client.commands = new Collection();

// ==========================================
// 📂 CARREGADOR DE COMANDOS (Command Handler)
// ==========================================
console.log('--- CARREGANDO COMANDOS ---');
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`[COMANDO] /${command.name} carregado no pente.`);
        } else {
            console.log(`[AVISO] A fita no arquivo ${file} tá faltando 'name' ou 'execute'.`);
        }
    }
}
iniciarSchedulerFarm(client);
console.log('[SISTEMA] Motor de reset de metas ativado!');
iniciarSchedulerExpurgo(client);
console.log('[SISTEMA] Motor de expurgo automático ativado!');
iniciarSchedulerVip(client);
console.log('[SISTEMA] Motor de expiração VIP ativado!');

// ==========================================
// 📂 CARREGADOR DE EVENTOS (Event Handler)
// ==========================================
console.log('\n--- CARREGANDO EVENTOS ---');
const eventsPath = path.join(__dirname, 'src', 'events');

// Função recursiva pra ler as subpastas (como a sua pasta ready/)
const loadEvents = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadEvents(filePath); // Se for pasta, entra nela e lê também
        } else if (file.endsWith('.js')) {
            const eventName = file.replace('.js', '');
            const eventFunction = require(filePath);
            
            // Atrelando o evento ao client do Discord
            if (typeof eventFunction === 'function') {
                // Se for o ready.js, ele executa uma vez (once), os outros ficam escutando (on)
                if (eventName === 'ready') {
                    client.once(eventName, eventFunction.bind(null, client));
                } else {
                    client.on(eventName, eventFunction.bind(null, client));
                }
                console.log(`[EVENTO] ${eventName} na escuta.`);
            }
        }
    }
};

loadEvents(eventsPath);

// ==========================================
// 🚀 LIGANDO A MÁQUINA
// ==========================================
async function ligarBot() {
    try {
        console.log('\n--- CONECTANDO AO BANCO DE DADOS ---');
        await iniciarBanco(); // Cria as tabelas multi-guild no Postgre

        console.log('\n--- LOGANDO NO DISCORD ---');
        await client.login(process.env.DISCORD_TOKEN);
        
        // Anti-Crash Bruto: Se der algum B.O não tratado, o bot não desliga
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[ANTI-CRASH] Rejeição não tratada:', promise, 'Motivo:', reason);
        });
        process.on('uncaughtException', (err) => {
            console.error('[ANTI-CRASH] Exceção não capturada:', err);
        });

    } catch (error) {
        console.error('[ERRO FATAL] Deu ruim ao ligar o sistema:', error);
    }
}

ligarBot();
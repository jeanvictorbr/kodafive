// src/events/interactionCreate.js
const fs = require('fs');
const path = require('path');

// Carrega todas as interações (Botões, sModais, Selects) em memória
const interactions = new Map();
const loadInteractions = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadInteractions(filePath);
        } else if (file.endsWith('.js')) {
            const interactionModule = require(filePath);
            if (interactionModule.customId) {
                interactions.set(interactionModule.customId, interactionModule);
            }
        }
    }
};

// Puxa da pasta src/interactions (CRIE ESSA PASTA)
loadInteractions(path.join(__dirname, '../interactions'));

module.exports = async (client, interaction) => {
    // Tratamento de Comandos /
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } 
        catch (error) { console.error('[ERRO]', error); }
        return;
    }

    // Tratamento de Context Menu (botão direito)
    if (interaction.isUserContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(client, interaction); } 
        catch (error) { console.error('[ERRO]', error); }
        return;
    }

    // Tratamento Modular de Botões, Modais e Selects
    let customId = interaction.customId;
    
    // Ajuste para IDs dinâmicos (ex: btn_aprovar_123456 -> pega só btn_aprovar)
    // Mais específicos primeiro pra evitar colisão
    if (customId && customId.startsWith('btn_aprovar_sugestao_')) customId = 'btn_aprovar_sugestao';
    if (customId && customId.startsWith('btn_recusar_sugestao_')) customId = 'btn_recusar_sugestao';
    if (customId && customId.startsWith('btn_analisar_sugestao_')) customId = 'btn_analisar_sugestao';
    if (customId && customId.startsWith('btn_aprovar_')) customId = 'btn_aprovar';
    if (customId && customId.startsWith('btn_reprovar_')) customId = 'btn_reprovar';
    if (customId && customId.startsWith('modal_tribunal_multa_')) customId = 'modal_tribunal_multa';
    if (customId && customId.startsWith('modal_tribunal_advertencia_')) customId = 'modal_tribunal_advertencia';
    if (customId && customId.startsWith('modal_tribunal_suspensao_')) customId = 'modal_tribunal_suspensao';
    if (customId && customId.startsWith('modal_add_tag_')) customId = 'modal_add_tag';
    if (customId && customId.startsWith('page_back_disabled')) return;
    if (customId && customId.startsWith('page_next_disabled')) return;

    const interactionHandler = interactions.get(customId);

    if (interactionHandler) {
        try {
            await interactionHandler.execute(client, interaction);
        } catch (error) {
            console.error(`[ERRO] Falha na interação ${customId}:`, error);
        }
    } else {
        console.log(`[AVISO] Interação sem arquivo: ${customId}`);
    }
};
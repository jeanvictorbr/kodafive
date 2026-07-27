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
    if (customId && customId.startsWith('btn_dev_vip_grant_')) customId = 'btn_dev_vip_grant';
    if (customId && customId.startsWith('btn_dev_vip_revoke_')) customId = 'btn_dev_vip_revoke';
    if (customId && customId.startsWith('btn_dev_confirm_')) customId = 'btn_dev_confirm';
    if (customId && customId.startsWith('btn_dev_cancel_')) customId = 'btn_dev_cancel';
    if (customId && customId.startsWith('btn_dev_pag_')) customId = 'btn_dev_pag';
    if (customId && customId.startsWith('btn_sug_aprovar_')) customId = 'btn_sug_aprovar';
    if (customId && customId.startsWith('btn_sug_recusar_')) customId = 'btn_sug_recusar';
    if (customId && customId.startsWith('btn_sug_analisar_')) customId = 'btn_sug_analisar';
    if (customId && customId.startsWith('btn_aprovar_')) customId = 'btn_aprovar';
    if (customId && customId.startsWith('btn_reprovar_')) customId = 'btn_reprovar';
    if (customId && customId.startsWith('modal_tribunal_multa_')) customId = 'modal_tribunal_multa';
    if (customId && customId.startsWith('modal_tribunal_advertencia_')) customId = 'modal_tribunal_advertencia';
    if (customId && customId.startsWith('modal_tribunal_suspensao_')) customId = 'modal_tribunal_suspensao';
    if (customId && customId.startsWith('modal_add_tag_')) customId = 'modal_add_tag';
    if (customId && customId.startsWith('page_back_disabled')) return;
    if (customId && customId.startsWith('page_next_disabled')) return;
    if (customId && customId.startsWith('page_back_p')) customId = 'page_back';
    if (customId && customId.startsWith('page_next_p')) customId = 'page_next';
    // Fallback genérico: se tem _p\d+ no final e o ID sem sufixo existe, usa ele
    const paginaSuffix = customId?.match(/^(.*?)_p\d+$/);
    if (paginaSuffix && interactions.has(paginaSuffix[1])) {
        customId = paginaSuffix[1];
    }
    if (customId && customId.startsWith('btn_voltar_menu_principal_p')) customId = 'btn_voltar_menu_principal';
    if (customId && /^btn_modulo_\w+_p\d+$/.test(customId)) {
        customId = customId.replace(/_p\d+$/, '');
    }

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
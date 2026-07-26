// src/interactions/buttons/btn_voltar_gestao.js
module.exports = {
    customId: 'btn_voltar_gestao',
    async execute(client, interaction) {
        // Redireciona a execução pro mesmo arquivo que gera o Menu de Gestão
        const menuGestao = require('./btn_modulo_recrutamento');
        await menuGestao.execute(client, interaction);
    }
};
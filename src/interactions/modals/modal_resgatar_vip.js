// src/interactions/modals/modal_resgatar_vip.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'modal_resgatar_vip',
    async execute(client, interaction) {
        const keyDigitada = interaction.fields.getTextInputValue('input_vip_key').trim();
        const guildId = interaction.guildId;

        try {
            // Busca a chave no cofre
            const result = await pool.query('SELECT * FROM vip_keys WHERE key = $1', [keyDigitada]);
            const keyData = result.rows[0];

            if (!keyData) {
                return interaction.reply({ content: '❌ **Chave inválida.** Tem certeza que digitou o código certo, chefe?', flags: 64 });
            }

            if (keyData.usada) {
                return interaction.reply({ content: '❌ **Chave queimada!** Esse código já foi ativado em outro servidor.', flags: 64 });
            }

            // Ativa o VIP do servidor
            await pool.query('UPDATE server_config SET is_vip = true WHERE guild_id = $1', [guildId]);
            
            // Queima a chave pra não usarem de novo
            await pool.query('UPDATE vip_keys SET usada = true, usada_por = $1, guild_id = $2 WHERE key = $3', [interaction.user.id, guildId, keyDigitada]);

            await interaction.reply({ 
                content: `💎 **MÁXIMO RESPEITO! O VIP FOI ATIVADO!**\n\nTodos os módulos do **Plano Patrão** (Arsenal, Baú, Tribunal) estão liberados pra você.\nClica em "Voltar" ou manda o \`/kodafive\` de novo para recarregar o painel.`, 
                flags: 64 
            });

        } catch (error) {
            console.error('[ERRO] Falha ao resgatar VIP:', error);
            await interaction.reply({ content: 'Deu ruim no sistema de validação. Avisa o suporte.', flags: 64 });
        }
    }
};
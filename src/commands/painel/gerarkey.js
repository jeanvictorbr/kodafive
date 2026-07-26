// src/commands/painel/gerarkey.js
const { pool } = require('../../database/db');
const crypto = require('crypto');

module.exports = {
    name: 'gerarkey',
    description: '[DEV] Gera uma chave VIP para comercialização',
    async execute(interaction) {
        // Trava absoluta de segurança
        if (interaction.user.id !== process.env.DEV_ID) {
            return interaction.reply({ content: 'Sai pra lá. Comando restrito da KODA STUDIOS.', flags: 64 });
        }

        // Gera a chave criptografada no padrão KODA
        const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
        const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
        const key = `KODA-${part1}-${part2}`;

        try {
            await pool.query('INSERT INTO vip_keys (key) VALUES ($1)', [key]);
            await interaction.reply({ content: `✅ **Chave VIP gerada e pronta pra venda!**\n\nChave: \`${key}\`\nEnvie este código para o cliente.`, flags: 64 });
        } catch (error) {
            console.error('[ERRO] Falha ao gerar chave:', error);
            await interaction.reply({ content: 'Deu b.o no banco ao gerar a chave.', flags: 64 });
        }
    }
};
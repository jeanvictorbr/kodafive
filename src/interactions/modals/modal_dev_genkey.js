const { pool } = require('../../database/db');
const crypto = require('crypto');
const { Routes } = require('discord.js');
const { buildPainelDevKeys } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'modal_dev_genkey',
    async execute(client, interaction) {
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd'));
        if (isNaN(qtd) || qtd < 1 || qtd > 50) {
            return interaction.reply({ content: '❌ Quantidade inválida (1-50).', flags: 64 });
        }

        const geradas = [];
        for (let i = 0; i < qtd; i++) {
            const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const key = `KODA-${part1}-${part2}`;
            await pool.query('INSERT INTO vip_keys (key) VALUES ($1)', [key]);
            geradas.push(key);
        }

        const painel = await buildPainelDevKeys(client);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });

        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `✅ **${qtd}** key(s) gerada(s)!\n\`\`\`${geradas.join('\n')}\`\`\``, flags: 64 } }
        ).catch(() => {});
    }
};

const { pool } = require('../../database/db');
const crypto = require('crypto');
const { Routes } = require('discord.js');
const { buildPainelDevKeys } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'modal_dev_genkeys_mass',
    async execute(client, interaction) {
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd'));
        if (isNaN(qtd) || qtd < 1 || qtd > 500) {
            return interaction.reply({ content: '❌ Quantidade inválida (1-500).', flags: 64 });
        }

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: [{
                type: 17, accent_color: 16753920,
                components: [{ type: 10, content: "# ⏳ Gerando keys...\nIsso pode levar alguns segundos." }]
            }] } }
        });

        const geradas = [];
        for (let i = 0; i < qtd; i++) {
            const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const key = `KODA-${part1}-${part2}`;
            await pool.query('INSERT INTO vip_keys (key) VALUES ($1)', [key]);
            geradas.push(key);
        }

        const painel = await buildPainelDevKeys(client);
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );

        const chunks = [];
        for (let i = 0; i < geradas.length; i += 15) {
            chunks.push(geradas.slice(i, i + 15));
        }

        const firstChunk = chunks.shift();
        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `✅ **${qtd}** keys geradas!\n\`\`\`${firstChunk.join('\n')}\`\`\``, flags: 64 } }
        ).catch(() => {});

        for (const chunk of chunks) {
            await client.rest.post(
                `/webhooks/${interaction.applicationId}/${interaction.token}`,
                { body: { content: `\`\`\`${chunk.join('\n')}\`\`\``, flags: 64 } }
            ).catch(() => {});
        }
    }
};

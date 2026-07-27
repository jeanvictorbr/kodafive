const { pool } = require('../../database/db');
const crypto = require('crypto');
const { Routes } = require('discord.js');
const { buildPainelDevKeys } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'modal_dev_genkey',
    async execute(client, interaction) {
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd'));
        const dias = parseInt(interaction.fields.getTextInputValue('input_dias'));
        const usos = parseInt(interaction.fields.getTextInputValue('input_usos'));

        if (isNaN(qtd) || qtd < 1 || qtd > 50) {
            return interaction.reply({ content: '❌ Quantidade inválida (1-50).', flags: 64 });
        }
        if (isNaN(dias) || dias < 0) {
            return interaction.reply({ content: '❌ Dias de duração inválido.', flags: 64 });
        }
        if (isNaN(usos) || usos < 1 || usos > 999) {
            return interaction.reply({ content: '❌ Usos máximo inválido (1-999).', flags: 64 });
        }

        const geradas = [];
        for (let i = 0; i < qtd; i++) {
            const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const key = `KODA-${part1}-${part2}`;
            await pool.query(
                'INSERT INTO vip_keys (key, dias_validade, usos_max) VALUES ($1, $2, $3)',
                [key, dias, usos]
            );
            geradas.push(key);
        }

        const painel = await buildPainelDevKeys(client);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });

        const info = dias > 0 ? `${dias} dias` : 'vitalício';
        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `✅ **${qtd}** key(s) gerada(s) (${info}, ${usos} uso(s))!\n\`\`\`${geradas.join('\n')}\`\`\``, flags: 64 } }
        ).catch(() => {});
    }
};

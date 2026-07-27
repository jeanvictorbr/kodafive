const { pool } = require('../../database/db');
const crypto = require('crypto');
const { Routes } = require('discord.js');
const { buildPainelDevKeys } = require('../../utils/buildPainelDev');
const { sendLogWebhook } = require('../../utils/webhookLogger');

module.exports = {
    customId: 'modal_dev_genkeys_mass',
    async execute(client, interaction) {
        const qtd = parseInt(interaction.fields.getTextInputValue('input_qtd'));
        const dias = parseInt(interaction.fields.getTextInputValue('input_dias'));
        const usos = parseInt(interaction.fields.getTextInputValue('input_usos'));

        if (isNaN(qtd) || qtd < 1 || qtd > 500) {
            return interaction.reply({ content: '❌ Quantidade inválida (1-500).', flags: 64 });
        }
        if (isNaN(dias) || dias < 0) {
            return interaction.reply({ content: '❌ Dias de duração inválido.', flags: 64 });
        }
        if (isNaN(usos) || usos < 1 || usos > 999) {
            return interaction.reply({ content: '❌ Usos máximo inválido (1-999).', flags: 64 });
        }

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: [{
                type: 17, accent_color: 16753920,
                components: [{ type: 10, content: "# ⏳ Gerando keys... pode levar alguns segundos." }]
            }] } }
        });

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
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );

        const info = dias > 0 ? `${dias} dias` : 'vitalício';
        const chunks = [];
        for (let i = 0; i < geradas.length; i += 15) chunks.push(geradas.slice(i, i + 15));

        const firstChunk = chunks.shift();
        await client.rest.post(
            `/webhooks/${interaction.applicationId}/${interaction.token}`,
            { body: { content: `✅ **${qtd}** keys geradas (${info}, ${usos} uso(s))!\n\`\`\`${firstChunk.join('\n')}\`\`\``, flags: 64 } }
        ).catch(() => {});

        for (const chunk of chunks) {
            await client.rest.post(
                `/webhooks/${interaction.applicationId}/${interaction.token}`,
                { body: { content: `\`\`\`${chunk.join('\n')}\`\`\``, flags: 64 } }
            ).catch(() => {});
        }

        await sendLogWebhook({
            embeds: [{
                color: 5763719,
                title: '🔑 KEYS GERADAS (Massa)',
                fields: [
                    { name: '👤 Gerado por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\` | \`${interaction.user.id}\`)`, inline: false },
                    { name: '📦 Quantidade', value: `\`${qtd}\``, inline: true },
                    { name: '⏳ Duração', value: dias > 0 ? `\`${dias} dias\`` : '`Vitalícia`', inline: true },
                    { name: '🔄 Usos', value: `\`${usos}\``, inline: true },
                    { name: '🔢 Keys', value: `\`\`\`${geradas.slice(0, 30).join(', ')}${geradas.length > 30 ? '...' : ''}\`\`\``, inline: false }
                ],
                footer: { text: `User ID: ${interaction.user.id}` },
                timestamp: new Date().toISOString()
            }]
        });
    }
};

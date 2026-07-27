const { pool } = require('../../database/db');
const { sendLogWebhook } = require('../../utils/webhookLogger');

module.exports = {
    customId: 'modal_resgatar_vip',
    async execute(client, interaction) {
        const keyDigitada = interaction.fields.getTextInputValue('input_vip_key').trim();
        const guildId = interaction.guildId;

        try {
            const result = await pool.query('SELECT * FROM vip_keys WHERE key = $1', [keyDigitada]);
            const keyData = result.rows[0];

            if (!keyData) {
                return interaction.reply({ content: '❌ **Chave inválida.** Tem certeza que digitou o código certo, chefe?', flags: 64 });
            }

            if (keyData.usos_atual >= keyData.usos_max) {
                return interaction.reply({ content: '❌ **Chave esgotada!** Essa key já atingiu o limite de usos.', flags: 64 });
            }

            const guild = client.guilds.cache.get(guildId);
            const guildNome = guild?.name || 'Desconhecido';
            const guildMembros = guild?.memberCount || 0;

            // Atualiza uso da key
            await pool.query(
                'UPDATE vip_keys SET usos_atual = usos_atual + 1, usada_por = $1, guild_id = $2 WHERE key = $3',
                [interaction.user.id, guildId, keyDigitada]
            );

            // Calcula expiração se tiver dias de validade
            let duracaoTexto = '';
            let expiraEm = null;
            if (keyData.dias_validade > 0) {
                expiraEm = new Date(Date.now() + keyData.dias_validade * 86400000);
                await pool.query(
                    'UPDATE server_config SET is_vip = true, vip_expira_em = $1 WHERE guild_id = $2',
                    [expiraEm, guildId]
                );
                duracaoTexto = `\n📅 **Expira em:** <t:${Math.floor(expiraEm.getTime() / 1000)}:R>`;
            } else {
                await pool.query(
                    'UPDATE server_config SET is_vip = true, vip_expira_em = NULL WHERE guild_id = $1',
                    [guildId]
                );
                duracaoTexto = '\n♾️ **Duração:** Vitalícia';
            }

            await interaction.reply({
                content: `💎 **MÁXIMO RESPEITO! O VIP FOI ATIVADO!**${duracaoTexto}\n\nTodos os módulos **VIP** estão liberados.\nManda o \`/kodafive\` de novo pra recarregar o painel.`,
                flags: 64
            });

            await sendLogWebhook({
                embeds: [{
                    color: 15844367,
                    title: '💎 VIP ATIVADO',
                    fields: [
                        { name: '🏠 Servidor', value: `\`${guildNome}\` (\`${guildId}\`)`, inline: false },
                        { name: '👤 Ativado por', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\` | \`${interaction.user.id}\`)`, inline: true },
                        { name: '🔑 Chave', value: `\`${keyDigitada}\``, inline: true },
                        { name: '⏳ Duração', value: keyData.dias_validade > 0 ? `\`${keyData.dias_validade} dias\` (expira <t:${Math.floor(expiraEm.getTime() / 1000)}:R>)` : '`Vitalícia`', inline: true },
                        { name: '📊 Usos', value: `\`${keyData.usos_atual + 1}/${keyData.usos_max}\``, inline: true },
                        { name: '👥 Membros', value: `\`${guildMembros}\``, inline: true }
                    ],
                    footer: { text: `Guild ID: ${guildId} • User ID: ${interaction.user.id}` },
                    timestamp: new Date().toISOString()
                }]
            });

        } catch (error) {
            console.error('[ERRO] Falha ao resgatar VIP:', error);
            await interaction.reply({ content: 'Deu ruim no sistema de validação. Avisa o suporte.', flags: 64 });
        }
    }
};

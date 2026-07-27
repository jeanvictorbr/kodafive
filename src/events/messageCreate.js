const { pool } = require('../database/db');

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (message.channel.type !== 1) return;

    const result = await pool.query(`
        SELECT ef.id, ef.quantidade, mfc.item_nome, mfc.meta_quantidade, ef.guild_id
        FROM entregas_farm ef
        JOIN meta_farm_config mfc ON ef.meta_id = mfc.id
        WHERE ef.user_id = $1 AND ef.comprovante_url IS NULL
        ORDER BY ef.data_registro DESC
        LIMIT 1
    `, [message.author.id]);

    if (result.rows.length === 0) return;

    const delivery = result.rows[0];

    const imageAttachment = message.attachments.find(a => a.contentType?.startsWith('image/'));
    if (!imageAttachment) {
        return message.reply('📸 O **print do depósito** é OBRIGATÓRIO pra validar a entrega. Manda a imagem aqui.');
    }

    await pool.query(
        'UPDATE entregas_farm SET comprovante_url = $1 WHERE id = $2',
        [imageAttachment.url, delivery.id]
    );

    await message.reply(`✅ **Comprovante registrado!** Sua entrega de \`${delivery.quantidade}x ${delivery.item_nome}\] foi validada com sucesso.`);

    const config = await pool.query('SELECT canal_log_farm_id FROM server_config WHERE guild_id = $1', [delivery.guild_id]);
    if (config.rows[0]?.canal_log_farm_id) {
        const logChannel = client.channels.cache.get(config.rows[0].canal_log_farm_id);
        if (logChannel) {
            const userAvatar = message.author.displayAvatarURL({ extension: 'png', size: 256 });

            const logPayload = [
                {
                    type: 17,
                    accent_color: 16711680,
                    components: [
                        {
                            type: 9,
                            components: [
                                { type: 10, content: `# 📋 Comprovante de Entrega\nRegistro de depósito auditado pela diretoria.` }
                            ],
                            accessory: { type: 11, media: { url: userAvatar } }
                        },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: `**Membro:** <@${message.author.id}>\n**Item:** ${delivery.item_nome}\n**Quantidade:** \`${delivery.quantidade.toLocaleString()}x\`\n**Meta:** \`${delivery.meta_quantidade.toLocaleString()} un\`\n**Data:** <t:${Math.floor(Date.now() / 1000)}:F>` },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: "🖼️ **Comprovante original:**" },
                        { type: 11, media: { url: imageAttachment.url } },
                        { type: 14, spacing: 1, divider: true },
                        { type: 10, content: "*💼 KODA STUDIOS • Sistema de Auditoria de Farm*" }
                    ]
                }
            ];

            await logChannel.send({ components: logPayload });
        }
    }
};

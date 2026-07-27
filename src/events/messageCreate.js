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
        return message.reply('📸 Manda o **print do depósito** como imagem pra eu registrar o comprovante.');
    }

    await pool.query(
        'UPDATE entregas_farm SET comprovante_url = $1 WHERE id = $2',
        [imageAttachment.url, delivery.id]
    );

    await message.reply(`✅ **Comprovante registrado!** Sua entrega de \`${delivery.quantidade}x ${delivery.item_nome}\] foi salva com o print. A diretoria vai auditar.`);

    const config = await pool.query('SELECT canal_log_farm_id FROM server_config WHERE guild_id = $1', [delivery.guild_id]);
    if (config.rows[0]?.canal_log_farm_id) {
        const logChannel = client.channels.cache.get(config.rows[0].canal_log_farm_id);
        if (logChannel) {
            await logChannel.send({
                content: `📋 **Nova Entrega com Comprovante**\n\n**Membro:** <@${message.author.id}>\n**Item:** ${delivery.item_nome}\n**Quantidade:** ${delivery.quantidade}x\n**Meta:** ${delivery.meta_quantidade.toLocaleString()} un\n**Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n🖼️ **Comprovante original:**`,
                files: [imageAttachment.url]
            });
        }
    }
};

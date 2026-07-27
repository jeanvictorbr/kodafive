const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pool } = require('../database/db');

async function buildPlantaoPublico(guildId, userId = null) {
    const cfg = await pool.query(
        'SELECT plantao_banner, plantao_desc FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const banner = cfg.rows[0]?.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = cfg.rows[0]?.plantao_desc || 'Controle quem está de serviço na facção.';

    const ativos = await pool.query(
        "SELECT user_id, inicio FROM plantao WHERE guild_id = $1 AND status = 'ativo' ORDER BY inicio ASC",
        [guildId]
    );

    let listaAtivos = '';
    for (const p of ativos.rows) {
        const inicioTs = Math.floor(new Date(p.inicio).getTime() / 1000);
        const badge = userId && p.user_id === userId ? ' 🔵' : '';
        listaAtivos += `<@${p.user_id}> — desde <t:${inicioTs}:R>${badge}\n`;
    }
    if (!listaAtivos) listaAtivos = 'Ninguém no momento.';

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('📋 Plantão da Facção')
        .setDescription(descricao)
        .setThumbnail(banner)
        .addFields({ name: `🟢 Em Serviço (${ativos.rows.length})`, value: listaAtivos })
        .setFooter({ text: 'Clique nos botões para iniciar/finalizar seu plantão' });

    const rows = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_plantao_iniciar')
                .setLabel('✅ Iniciar Plantão')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('btn_plantao_finalizar')
                .setLabel('🔴 Finalizar Plantão')
                .setStyle(ButtonStyle.Danger)
        )
    ];

    return { embeds: [embed], components: rows };
}

module.exports = { buildPlantaoPublico };

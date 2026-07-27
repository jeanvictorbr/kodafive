const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pool } = require('../database/db');

async function buildPlantaoPublico(guildId, userId = null) {
    const cfg = await pool.query(
        'SELECT plantao_banner, plantao_desc, cargo_plantao_id FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const r = cfg.rows[0] || {};
    const banner = r.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = r.plantao_desc || 'Organize a escala de serviço da liderança.';
    const cargoPlantaoId = r.cargo_plantao_id || null;

    const ativos = await pool.query(
        "SELECT user_id, cargo, inicio FROM plantao WHERE guild_id = $1 AND status = 'ativo' ORDER BY inicio ASC",
        [guildId]
    );

    let listaAtivos = '';
    for (const p of ativos.rows) {
        const inicioTs = Math.floor(new Date(p.inicio).getTime() / 1000);
        const badge = userId && p.user_id === userId ? ' 🔵' : '';
        listaAtivos += `<@${p.user_id}> — **${p.cargo}** desde <t:${inicioTs}:R>${badge}\n`;
    }
    if (!listaAtivos) listaAtivos = 'Ninguém no momento.';

    const escopo = cargoPlantaoId ? `<@&${cargoPlantaoId}>` : 'Liderança/Recrutadores';

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('📋 Plantão — Escala de Serviço')
        .setDescription(`${descricao}\n\n🎯 **Quem pode assumir:** ${escopo}\n📌 *Não é ponto eletrônico. Plantão organiza quem cobre cada função.*`)
        .setThumbnail(banner)
        .addFields({ name: `🟢 Cobertura Agora (${ativos.rows.length})`, value: listaAtivos })
        .setFooter({ text: 'Clique em "Assumir" para se responsabilizar por uma função agora' });

    const rows = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_plantao_iniciar')
                .setLabel('✅ Assumir Plantão')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('btn_plantao_finalizar')
                .setLabel('🔴 Encerrar Plantão')
                .setStyle(ButtonStyle.Danger)
        )
    ];

    return { embeds: [embed], components: rows };
}

module.exports = { buildPlantaoPublico };

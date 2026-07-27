const { pool } = require('../database/db');
const { calcularNivel, xpParaProximoNivel } = require('./xpHelper');

async function buildPainelPerfil(client, guildId, userId) {
    const user = await client.users.fetch(userId).catch(() => null);
    const avatarUrl = user?.displayAvatarURL({ extension: 'png', size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

    const [membro, recrutamento, farm, ponto, conduta] = await Promise.all([
        pool.query('SELECT xp, nivel, data_entrada FROM membros WHERE guild_id = $1 AND user_id = $2', [guildId, userId]),
        pool.query("SELECT nome_rp, passaporte, status, data_registro FROM recrutamento WHERE guild_id = $1 AND user_id = $2 ORDER BY data_registro DESC LIMIT 1", [guildId, userId]),
        pool.query("SELECT SUM(quantidade) as total FROM entregas_farm WHERE guild_id = $1 AND user_id = $2 AND status = 'validado'", [guildId, userId]),
        pool.query("SELECT COUNT(*) as total FROM bate_ponto WHERE guild_id = $1 AND user_id = $2", [guildId, userId]),
        pool.query("SELECT tipo, COUNT(*) as total FROM conduta WHERE guild_id = $1 AND user_id = $2 GROUP BY tipo", [guildId, userId])
    ]);

    const membroData = membro.rows[0] || { xp: 0, nivel: 1, data_entrada: null };
    const recData = recrutamento.rows[0] || null;
    const totalFarm = parseInt(farm.rows[0]?.total) || 0;
    const totalPonto = parseInt(ponto.rows[0]?.total) || 0;

    const multas = conduta.rows.find(r => r.tipo === 'multa')?.total || 0;
    const advertencias = conduta.rows.find(r => r.tipo === 'advertencia')?.total || 0;
    const suspensoes = conduta.rows.find(r => r.tipo === 'suspensao')?.total || 0;

    const xpAtual = membroData.xp;
    const nivel = membroData.nivel || calcularNivel(xpAtual);
    const xpRestante = xpParaProximoNivel(xpAtual);

    const nomeRp = recData?.nome_rp || 'Não registrado';
    const passaporte = recData?.passaporte || '---';
    const statusRp = recData?.status || '---';
    const entradaRp = recData?.data_registro
        ? `<t:${Math.floor(new Date(recData.data_registro).getTime() / 1000)}:f>`
        : '---';

    return [
        {
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [
                        { type: 10, content: `# 📋 Dossiê do Membro\n<@${userId}>` }
                    ],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 👤 Identificação\n> **Nome RP:** \`${nomeRp}\`\n> **Passaporte:** \`${passaporte}\`\n> **Status:** \`${statusRp}\`\n> **Entrada:** ${entradaRp}`
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### ⭐ Progresso\n> **Nível:** \`${nivel}\`\n> **XP Total:** \`${xpAtual} XP\`\n> **Próximo nível:** \`${xpRestante} XP restante\``
                },
                { type: 14, spacing: 1, divider: true },
                {
                    type: 10,
                    content: `### 📊 Estatísticas\n> **Farm entregue:** \`${totalFarm.toLocaleString()} itens\`\n> **Ponto registrados:** \`${totalPonto} vezes\`\n> **Multas:** \`${multas}\` | **Advertências:** \`${advertencias}\` | **Suspensões:** \`${suspensoes}\``
                },
                { type: 14, spacing: 1, divider: true },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Gestão Inteligente*" }
            ]
        }
    ];
}

module.exports = { buildPainelPerfil };

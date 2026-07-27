const { pool } = require('../database/db');

const BLOCOS = [
    { label: '🌅 00h-03h', inicio: '00:00', fim: '03:00' },
    { label: '🌃 03h-06h', inicio: '03:00', fim: '06:00' },
    { label: '🌄 06h-09h', inicio: '06:00', fim: '09:00' },
    { label: '☀️ 09h-12h', inicio: '09:00', fim: '12:00' },
    { label: '⛅ 12h-15h', inicio: '12:00', fim: '15:00' },
    { label: '🌤️ 15h-18h', inicio: '15:00', fim: '18:00' },
    { label: '🌆 18h-21h', inicio: '18:00', fim: '21:00' },
    { label: '🌙 21h-00h', inicio: '21:00', fim: '00:00' },
];

async function buildPlantaoPublico(guildId) {
    const cfg = await pool.query(
        'SELECT plantao_banner, plantao_desc, cargo_plantao_id FROM server_config WHERE guild_id = $1',
        [guildId]
    );
    const r = cfg.rows[0] || {};
    const banner = r.plantao_banner || 'https://i.ibb.co/68037k9/banner-placeholder.png';
    const descricao = r.plantao_desc || 'Organiza a escala de serviço da liderança.';
    const cargoPlantaoId = r.cargo_plantao_id || null;

    const hoje = new Date().toISOString().split('T')[0];

    const ativos = await pool.query(
        "SELECT user_id, cargo, inicio FROM plantao WHERE guild_id = $1 AND status = 'ativo' AND tipo = 'agora' ORDER BY inicio ASC",
        [guildId]
    );

    const agendados = await pool.query(
        "SELECT user_id, cargo, hora_inicio, hora_fim FROM plantao WHERE guild_id = $1 AND data_plantao = $2 AND status = 'agendado' ORDER BY hora_inicio ASC",
        [guildId, hoje]
    );

    let listaAtivos = '';
    for (const p of ativos.rows) {
        const inicioTs = Math.floor(new Date(p.inicio).getTime() / 1000);
        listaAtivos += `<@${p.user_id}> — **${p.cargo}** desde <t:${inicioTs}:R>\n`;
    }
    if (!listaAtivos) listaAtivos = 'Ninguém na ativa agora.';

    let escalaStr = '';
    for (const bloco of BLOCOS) {
        const ocupantes = agendados.rows.filter(
            p => p.hora_inicio === bloco.inicio && p.hora_fim === bloco.fim
        );
        const quem = ocupantes.length > 0
            ? ocupantes.map(p => `<@${p.user_id}> (${p.cargo})`).join(', ')
            : 'vago';
        escalaStr += `> **${bloco.label}:** ${quem}\n`;
    }
    if (!escalaStr) escalaStr = '> Nenhum horário agendado ainda.';

    const escopo = cargoPlantaoId ? `<@&${cargoPlantaoId}>` : 'Recrutador • Gerente • Liderança';

    const components = [
        { type: 12, items: [{ media: { url: banner } }] },
        { type: 10, content: `# 📋 Escala de Serviço\n${descricao}\n\n🎯 **Quem pode assumir:** ${escopo}\n📌 *Não é ponto eletrônico — é escala de cobertura.*` },
        { type: 14, spacing: 1, divider: true },
        { type: 10, content: `### 🟢 Cobertura Agora (${ativos.rows.length})\n${listaAtivos}` },
        { type: 14, spacing: 1, divider: true },
        { type: 10, content: `### 📅 Escala de Hoje\n${escalaStr}` },
        { type: 14, spacing: 1, divider: true },
        {
            type: 1,
            components: [
                { type: 2, style: 3, custom_id: "btn_plantao_iniciar", label: "✅ Assumir Agora", emoji: { name: "✅" } },
                { type: 2, style: 2, custom_id: "btn_plantao_agendar", label: "📅 Agendar Horário", emoji: { name: "📅" } },
                { type: 2, style: 4, custom_id: "btn_plantao_finalizar", label: "🔴 Encerrar", emoji: { name: "🔴" } },
            ]
        },
        { type: 10, content: "*📋 KODA STUDIOS • Escala de Serviço*" }
    ];

    return [{ type: 17, accent_color: 3447003, components }];
}

module.exports = { buildPlantaoPublico, BLOCOS };

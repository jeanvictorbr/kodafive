const { pool } = require('../../database/db');

module.exports = {
    customId: 'select_ver_ficha',
    async execute(client, interaction) {
        const userId = interaction.values[0];
        const guildId = interaction.guildId;

        const registros = await pool.query(`
            SELECT tipo, motivo, valor, duracao_horas, ativa, data, aplicado_por
            FROM conduta
            WHERE guild_id = $1 AND user_id = $2
            ORDER BY data DESC
        `, [guildId, userId]);

        if (registros.rows.length === 0) {
            return interaction.reply({ content: `👤 Ficha de <@${userId}>: **Nenhum registro de conduta encontrado.**`, flags: 64 });
        }

        const totalMultas = registros.rows.filter(r => r.tipo === 'multa').reduce((acc, r) => acc + r.valor, 0);
        const qtdAdvertencias = registros.rows.filter(r => r.tipo === 'advertencia').length;
        const suspensoesAtivas = registros.rows.filter(r => r.tipo === 'suspensao' && r.ativa);

        let ficha = `# 👤 Ficha de Conduta\n<@${userId}>\n\n`;
        ficha += `### 📊 Resumo\n> **Total de Multas:** \`R$${totalMultas.toLocaleString()}\`\n> **Advertências:** \`${qtdAdvertencias}\`\n> **Suspensões Ativas:** \`${suspensoesAtivas.length}\`\n\n`;
        ficha += `### 📋 Últimos Registros\n`;

        const ultimos = registros.rows.slice(0, 10);
        for (const r of ultimos) {
            const emoji = r.tipo === 'multa' ? '💰' : r.tipo === 'advertencia' ? '📋' : '🔒';
            const valorStr = r.tipo === 'multa' ? ` | \`R$${r.valor.toLocaleString()}\`` : '';
            const ativaStr = r.tipo === 'suspensao' ? (r.ativa ? ' `🟠 Ativa`' : ' `✅ Expirada`') : '';
            ficha += `> ${emoji} **${r.tipo.toUpperCase()}**${valorStr}${ativaStr}\n> ${r.motivo}\n> <t:${Math.floor(new Date(r.data).getTime() / 1000)}:f> por <@${r.aplicado_por}>\n\n`;
        }

        await interaction.reply({
            flags: 32832,
            components: [
                {
                    type: 17,
                    accent_color: 15548997,
                    components: [
                        { type: 10, content: ficha }
                    ]
                }
            ]
        });
    }
};

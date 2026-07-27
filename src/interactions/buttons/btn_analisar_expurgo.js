const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_analisar_expurgo',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT * FROM config_expurgo WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        const diasPonto = config.dias_sem_ponto || 30;
        const diasFarm = config.dias_sem_farm || 30;
        const cargoRemover = config.cargo_remover_id;
        const cargoManter = config.cargo_manter_id;

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 16753920,
                        components: [{ type: 10, content: "# 🔍 Analisando membros inativos..." }]
                    }]
                }
            }
        });

        const limitePonto = new Date(Date.now() - diasPonto * 24 * 60 * 60 * 1000);
        const limiteFarm = new Date(Date.now() - diasFarm * 24 * 60 * 60 * 1000);

        const inativos = await pool.query(`
            SELECT
                m.user_id,
                MAX(bp.entrada) as ultimo_ponto,
                MAX(ef.data_registro) as ultimo_farm
            FROM membros m
            LEFT JOIN bate_ponto bp ON bp.user_id = m.user_id AND bp.guild_id = $1
            LEFT JOIN entregas_farm ef ON ef.user_id = m.user_id AND ef.guild_id = $1 AND ef.status = 'validado'
            WHERE m.guild_id = $1
            GROUP BY m.user_id
            HAVING (COALESCE(MAX(bp.entrada), '2000-01-01') < $2 OR COALESCE(MAX(ef.data_registro), '2000-01-01') < $3)
            ORDER BY m.user_id
        `, [interaction.guildId, limitePonto, limiteFarm]);

        let afetados = 0;
        let semCargo = 0;
        let mantidos = 0;
        const detalhes = [];

        for (const row of inativos.rows) {
            try {
                const member = await interaction.guild.members.fetch(row.user_id).catch(() => null);
                if (!member || member.user.bot) continue;

                if (cargoManter && member.roles.cache.has(cargoManter)) { mantidos++; continue; }

                const diasUltimoPonto = Math.floor((Date.now() - new Date(row.ultimo_ponto || '2000-01-01').getTime()) / 86400000);
                const diasUltimoFarm = Math.floor((Date.now() - new Date(row.ultimo_farm || '2000-01-01').getTime()) / 86400000);

                const motivos = [];
                if (diasUltimoPonto >= diasPonto) motivos.push(`⏰ sem bater ponto há **${diasUltimoPonto}d** (limite: ${diasPonto}d)`);
                if (diasUltimoFarm >= diasFarm) motivos.push(`🌾 sem farmar há **${diasUltimoFarm}d** (limite: ${diasFarm}d)`);

                if (!cargoRemover || member.roles.cache.has(cargoRemover)) {
                    afetados++;
                    detalhes.push(`${member} → ${motivos.join('; ')}`);
                } else {
                    semCargo++;
                }
            } catch { semCargo++; }
            await new Promise(r => setTimeout(r, 100));
        }

        let corpo = '';
        if (detalhes.length > 0) {
            const limite = 30;
            const exibidos = detalhes.slice(0, limite);
            corpo = exibidos.join('\n');
            if (detalhes.length > limite) {
                corpo += `\n… e mais **${detalhes.length - limite}** membros afetados.`;
            }
        } else {
            corpo = 'Nenhum membro seria afetado no momento. ✅';
        }

        const mensagem = `# ✅ Análise Concluída

**📊 Resumo:**
> 🔴 Seriam afetados: **${afetados}** membros
> ⚪ Já sem o cargo: **${semCargo}** membros
> 🟢 Mantidos (cargo especial): **${mantidos}** membros
> 📋 Total inativos encontrados: **${inativos.rows.length}**

**📝 Detalhes dos afetados:**
${corpo}`;

        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                body: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: afetados > 0 ? 16753920 : 65280,
                        components: [{ type: 10, content: mensagem }]
                    }]
                }
            }
        );
    }
};

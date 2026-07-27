const { pool } = require('../database/db');

function iniciarSchedulerExpurgo(client) {
    setInterval(async () => {
        try {
            const configs = await pool.query('SELECT * FROM config_expurgo WHERE ativo = true');

            for (const cfg of configs.rows) {
                const guildId = cfg.guild_id;
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                const diasPonto = cfg.dias_sem_ponto || 30;
                const diasFarm = cfg.dias_sem_farm || 30;
                const avisoDias = cfg.aviso_dias || 5;
                const cargoRemover = cfg.cargo_remover_id;
                const cargoAplicar = cfg.cargo_aplicar_id;
                const canalLogId = cfg.canal_log_id;
                const cargoManter = cfg.cargo_manter_id;

                const limitePonto = new Date(Date.now() - diasPonto * 24 * 60 * 60 * 1000);
                const limiteFarm = new Date(Date.now() - diasFarm * 24 * 60 * 60 * 1000);

                const inativos = await pool.query(`
                    SELECT DISTINCT m.user_id FROM membros m
                    LEFT JOIN bate_ponto bp ON bp.user_id = m.user_id AND bp.guild_id = $1
                    LEFT JOIN entregas_farm ef ON ef.user_id = m.user_id AND ef.guild_id = $1 AND ef.status = 'validado'
                    WHERE m.guild_id = $1
                    GROUP BY m.user_id
                    HAVING (COALESCE(MAX(bp.entrada), '2000-01-01') < $2 OR COALESCE(MAX(ef.data_registro), '2000-01-01') < $3)
                `, [guildId, limitePonto, limiteFarm]);

                for (const row of inativos.rows) {
                    try {
                        const member = await guild.members.fetch(row.user_id).catch(() => null);
                        if (!member || member.user.bot) continue;
                        if (cargoManter && member.roles.cache.has(cargoManter)) continue;

                        if (cargoRemover && member.roles.cache.has(cargoRemover)) {
                            await member.roles.remove(cargoRemover).catch(() => {});
                        }
                        if (cargoAplicar) {
                            await member.roles.add(cargoAplicar).catch(() => {});
                        }

                        if (canalLogId) {
                            const logChannel = client.channels.cache.get(canalLogId);
                            if (logChannel) {
                                await logChannel.send({ content: `🧹 **Expurgo:** <@${row.user_id}> perdeu o cargo por inatividade.` }).catch(() => {});
                            }
                        }
                    } catch {}
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        } catch (error) {
            console.error('[EXPURGO] Erro no scheduler:', error);
        }
    }, 3600000);
}

module.exports = { iniciarSchedulerExpurgo };

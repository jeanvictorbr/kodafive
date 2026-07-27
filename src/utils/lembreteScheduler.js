const { pool } = require('../database/db');

function iniciarLembreteScheduler(client) {
    setInterval(async () => {
        try {
            const configs = await pool.query(
                "SELECT * FROM config_lembrete WHERE ativo = true AND canal_log_id != ''"
            );

            for (const cfg of configs.rows) {
                const guild = client.guilds.cache.get(cfg.guild_id);
                if (!guild) continue;
                const canal = guild.channels.cache.get(cfg.canal_log_id);
                if (!canal) continue;

                const alerts = [];

                // 1. Verifica membros sem ponto há X dias
                if (cfg.dias_sem_ponto > 0) {
                    const inativos = await pool.query(
                        `SELECT DISTINCT user_id FROM membros WHERE guild_id = $1 
                         AND user_id NOT IN (
                             SELECT user_id FROM bate_ponto 
                             WHERE guild_id = $1 AND entrada > NOW() - ($2 || ' days')::interval
                         )`,
                        [cfg.guild_id, cfg.dias_sem_ponto.toString()]
                    );

                    for (const m of inativos.rows) {
                        try {
                            const member = await guild.members.fetch(m.user_id).catch(() => null);
                            if (member) {
                                alerts.push(`> <@${m.user_id}> — **${cfg.dias_sem_ponto}+ dias** sem bater ponto`);
                            }
                        } catch {}
                    }
                }

                // 2. Verifica metas de farm perto do fim
                if (cfg.avisar_farm) {
                    const configGeral = await pool.query(
                        'SELECT ciclo_farm FROM server_config WHERE guild_id = $1',
                        [cfg.guild_id]
                    );
                    const ciclo = configGeral.rows[0]?.ciclo_farm || 'semanal';
                    const diasRestante = ciclo === 'mensal' ? 3 : 1;

                    alerts.push(`> ⏰ Meta de farm **${ciclo}** fecha em aproximadamente **${diasRestante} dia(s)**`);
                }

                if (alerts.length > 0) {
                    const titulo = alerts.length === 1 ? '1 alerta' : `${alerts.length} alertas`;
                    await canal.send({
                        content: `⏰ **Lembrete Automático — ${titulo}**\n${alerts.join('\n')}`
                    }).catch(() => {});
                }
            }
        } catch (error) {
            console.error('[LEMBRETE] Erro no scheduler:', error);
        }
    }, 21600000);
}

module.exports = { iniciarLembreteScheduler };

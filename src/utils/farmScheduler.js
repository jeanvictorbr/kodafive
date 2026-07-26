// src/utils/farmScheduler.js
const { pool } = require('../database/db');

function iniciarSchedulerFarm(client) {
    // Roda a checagem a cada 1 hora (3600000 ms)
    setInterval(async () => {
        try {
            const agora = new Date();
            
            // Puxa a configuração de ciclo de cada servidor
            const servers = await pool.query('SELECT guild_id, ciclo_farm FROM server_config');

            for (const server of servers.rows) {
                const guildId = server.guild_id;
                const ciclo = server.ciclo_farm || 'semanal';

                // Puxa as metas do servidor para ver a data do ciclo atual (baseada no item mais antigo ou na criação da primeira meta)
                const metas = await pool.query('SELECT id, criado_em FROM meta_farm_config WHERE guild_id = $1 ORDER BY criado_em ASC LIMIT 1', [guildId]);
                
                if (metas.rows.length === 0) continue;

                const criadoEm = new Date(metas.rows[0].criado_em);
                let deveResetar = false;
                let diffTempo = agora - criadoEm;

                const umaHora = 60 * 60 * 1000;
                const umDia = 24 * umaHora;
                const umaSemana = 7 * umDia;
                const umMes = 30 * umDia;

                if (ciclo === 'diario' && diffTempo >= umDia) {
                    deveResetar = true;
                } else if (ciclo === 'semanal' && diffTempo >= umaSemana) {
                    deveResetar = true;
                } else if (ciclo === 'mensal' && diffTempo >= umMes) {
                    deveResetar = true;
                }

                if (deveResetar) {
                    console.log(`[FARM] O ciclo ${ciclo} da guilda ${guildId} expirou. Resetando placar de farm...`);

                    // 1. Zera/Deleta todas as entregas de farm dessa guilda
                    await pool.query('DELETE FROM entregas_farm WHERE guild_id = $1', [guildId]);

                    // 2. Atualiza a data de criação de todas as metas da guilda para o momento atual (reiniciando o ciclo)
                    await pool.query('UPDATE meta_farm_config SET criado_em = CURRENT_TIMESTAMP WHERE guild_id = $1', [guildId]);

                    console.log(`[FARM] Placar de farm da guilda ${guildId} resetado com sucesso para um novo ciclo!`);
                }
            }
        } catch (error) {
            console.error('[ERRO] Falha no scheduler de reset automático de farm:', error);
        }
    }, 3600000); // 1 hora
}

module.exports = { iniciarSchedulerFarm };
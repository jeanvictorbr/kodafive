// src/utils/farmScheduler.js
const { pool } = require('../database/db');

function iniciarSchedulerFarm(client) {
    // Roda a checagem a cada 1 hora (3600000 ms)
    setInterval(async () => {
        try {
            const agora = new Date();
            const metas = await pool.query('SELECT * FROM meta_farm_config');

            for (const meta of metas.rows) {
                const criadoEm = new Date(meta.criado_em);
                let deveResetar = false;
                let diffTempo = agora - criadoEm;

                // Converte tempo dependendo do ciclo
                const umaHora = 60 * 60 * 1000;
                const umDia = 24 * umaHora;
                const umaSemana = 7 * umDia;
                const umMes = 30 * umDia;

                if (meta.ciclo === 'diario' && diffTempo >= umDia) {
                    deveResetar = true;
                } else if (meta.ciclo === 'semanal' && diffTempo >= umaSemana) {
                    deveResetar = true;
                } else if (meta.ciclo === 'mensal' && diffTempo >= umMes) {
                    deveResetar = true;
                }

                if (deveResetar) {
                    console.log(`[FARM] O ciclo da meta [ID ${meta.id}] (${meta.item_nome}) expirou. Resetando entregas...`);

                    // 1. Deleta as entregas antigas vinculadas a esta meta
                    await pool.query('DELETE FROM entregas_farm WHERE meta_id = $1', [meta.id]);

                    // 2. Atualiza a data de criação para renovar o ciclo
                    await pool.query('UPDATE meta_farm_config SET criado_em = CURRENT_TIMESTAMP WHERE id = $1', [meta.id]);

                    console.log(`[FARM] Meta [ID ${meta.id}] resetada com sucesso para um novo ciclo!`);
                }
            }
        } catch (error) {
            console.error('[ERRO] Falha no scheduler de reset automático de farm:', error);
        }
    }, 3600000); // 1 hora
}

module.exports = { iniciarSchedulerFarm };
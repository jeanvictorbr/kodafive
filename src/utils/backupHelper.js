const { pool } = require('../database/db');

async function exportarConfig(guildId) {
    const [serverConfig, cargoTags, metasFarm, autoResposta, aliancas, configExpurgo] = await Promise.all([
        pool.query('SELECT * FROM server_config WHERE guild_id = $1', [guildId]),
        pool.query('SELECT * FROM cargo_tags WHERE guild_id = $1', [guildId]),
        pool.query('SELECT * FROM meta_farm_config WHERE guild_id = $1', [guildId]),
        pool.query('SELECT * FROM auto_resposta WHERE guild_id = $1', [guildId]),
        pool.query('SELECT * FROM aliancas WHERE guild_id = $1', [guildId]),
        pool.query('SELECT * FROM config_expurgo WHERE guild_id = $1', [guildId])
    ]);

    return {
        version: 1,
        guild_id: guildId,
        exportado_em: new Date().toISOString(),
        server_config: serverConfig.rows[0] || null,
        cargo_tags: cargoTags.rows,
        metas_farm: metasFarm.rows,
        auto_resposta: autoResposta.rows,
        aliancas: aliancas.rows,
        config_expurgo: configExpurgo.rows[0] || null
    };
}

async function importarConfig(client, guildId, data) {
    const resultados = { sucessos: 0, erros: 0 };

    try {
        if (data.server_config) {
            const sc = data.server_config;
            await pool.query(
                `INSERT INTO server_config (guild_id, nome_faccao, is_vip, canal_rh_id, cargo_aprovado_id, cargo_recrutador_id, 
                 canal_log_farm_id, canal_log_tribunal_id, cargo_tribunal_id, canal_ponto_id, ciclo_farm, cargo_alerta_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 ON CONFLICT (guild_id) DO UPDATE SET
                 nome_faccao = $2, is_vip = $3, canal_rh_id = $4, cargo_aprovado_id = $5,
                 cargo_recrutador_id = $6, canal_log_farm_id = $7, canal_log_tribunal_id = $8,
                 cargo_tribunal_id = $9, canal_ponto_id = $10, ciclo_farm = $11, cargo_alerta_id = $12`,
                [guildId, sc.nome_faccao, sc.is_vip, sc.canal_rh_id, sc.cargo_aprovado_id,
                 sc.cargo_recrutador_id, sc.canal_log_farm_id, sc.canal_log_tribunal_id,
                 sc.cargo_tribunal_id, sc.canal_ponto_id, sc.ciclo_farm, sc.cargo_alerta_id]
            );
            resultados.sucessos++;
        }

        for (const tag of (data.cargo_tags || [])) {
            await pool.query(
                `INSERT INTO cargo_tags (guild_id, cargo_id, tag) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [guildId, tag.cargo_id, tag.tag]
            );
            resultados.sucessos++;
        }
        for (const faq of (data.auto_resposta || [])) {
            await pool.query(
                `INSERT INTO auto_resposta (guild_id, palavra_chave, resposta) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [guildId, faq.palavra_chave, faq.resposta]
            );
            resultados.sucessos++;
        }
        for (const a of (data.aliancas || [])) {
            await pool.query(
                `INSERT INTO aliancas (guild_id, nome, tipo, descricao, icone_url, posicao) VALUES ($1, $2, $3, $4, $5, $6)`,
                [guildId, a.nome, a.tipo, a.descricao, a.icone_url, a.posicao]
            );
            resultados.sucessos++;
        }
        if (data.config_expurgo) {
            const ce = data.config_expurgo;
            await pool.query(
                `INSERT INTO config_expurgo (guild_id, ativo, dias_sem_ponto, dias_sem_farm, cargo_remover_id, cargo_aplicar_id, canal_log_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (guild_id) DO UPDATE SET
                 ativo = $2, dias_sem_ponto = $3, dias_sem_farm = $4, cargo_remover_id = $5, cargo_aplicar_id = $6, canal_log_id = $7`,
                [guildId, ce.ativo, ce.dias_sem_ponto, ce.dias_sem_farm, ce.cargo_remover_id, ce.cargo_aplicar_id, ce.canal_log_id]
            );
            resultados.sucessos++;
        }
    } catch (error) {
        console.error('[BACKUP] Erro na importação:', error);
        resultados.erros++;
    }

    return resultados;
}

module.exports = { exportarConfig, importarConfig };

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelExpurgo } = require('../../utils/buildPainelExpurgo');

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
                        components: [{ type: 10, content: "# 🔍 Analisando membros..." }]
                    }]
                }
            }
        });

        const limitePonto = new Date(Date.now() - diasPonto * 24 * 60 * 60 * 1000);
        const limiteFarm = new Date(Date.now() - diasFarm * 24 * 60 * 60 * 1000);

        const inativos = await pool.query(`
            SELECT DISTINCT m.user_id FROM membros m
            LEFT JOIN bate_ponto bp ON bp.user_id = m.user_id AND bp.guild_id = $1
            LEFT JOIN entregas_farm ef ON ef.user_id = m.user_id AND ef.guild_id = $1 AND ef.status = 'validado'
            WHERE m.guild_id = $1
            GROUP BY m.user_id
            HAVING (COALESCE(MAX(bp.entrada), '2000-01-01') < $2 OR COALESCE(MAX(ef.data_registro), '2000-01-01') < $3)
        `, [interaction.guildId, limitePonto, limiteFarm]);

        let afetados = 0;
        let semCargo = 0;
        let mantidos = 0;

        for (const row of inativos.rows) {
            try {
                const member = await interaction.guild.members.fetch(row.user_id).catch(() => null);
                if (!member || member.user.bot) continue;
                if (cargoManter && member.roles.cache.has(cargoManter)) { mantidos++; continue; }
                if (cargoRemover && member.roles.cache.has(cargoRemover)) afetados++;
                else semCargo++;
            } catch { semCargo++; }
            await new Promise(r => setTimeout(r, 100));
        }

        const mensagem = `# ✅ Análise Concluída\n> **Membros inativos encontrados:** \`${inativos.rows.length}\`\n> **Seriam afetados (com o cargo):** \`${afetados}\`\n> **Já sem o cargo:** \`${semCargo}\`\n> **Mantidos (cargo especial):** \`${mantidos}\`\n\n${afetados > 0 ? '⚠️ Ative o expurgo para remover automaticamente.' : '✅ Nenhum membro seria afetado no momento.'}`;

        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: [{
                type: 17,
                accent_color: afetados > 0 ? 16753920 : 65280,
                components: [{ type: 10, content: mensagem }]
            }] } }
        );

        await new Promise(r => setTimeout(r, 3000));

        const painel = await buildPainelExpurgo(interaction);
        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            { body: { flags: 32832, components: painel } }
        );
    }
};

const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPlantaoPublico } = require('../../utils/buildPainelPlantaoPublico');

module.exports = {
    customId: 'select_plantao_cargo',
    async execute(client, interaction) {
        const cargo = interaction.values[0];
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        await pool.query(
            'INSERT INTO plantao (guild_id, user_id, cargo, tipo, inicio, status) VALUES ($1, $2, $3, $4, NOW(), $5)',
            [guildId, userId, cargo, 'agora', 'ativo']
        );

        const config = await pool.query(
            'SELECT plantao_msg_id, plantao_msg_canal_id FROM server_config WHERE guild_id = $1',
            [guildId]
        );
        const r = config.rows[0] || {};

        if (r.plantao_msg_id && r.plantao_msg_canal_id) {
            const canal = interaction.guild.channels.cache.get(r.plantao_msg_canal_id);
            if (canal) {
                try {
                    const msg = await canal.messages.fetch(r.plantao_msg_id);
                    const painel = await buildPlantaoPublico(guildId, userId);
                    await msg.edit({ flags: 32768, components: painel });
                } catch {}
            }
        }

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: [{
                type: 17, accent_color: 4437377,
                components: [
                    { type: 10, content: `# ✅ Suave!\n<@${userId}> tá na ativa como **${cargo}** desde agora.` },
                    { type: 14, spacing: 1, divider: true },
                    { type: 10, content: "Quando quiser sair, é só voltar no painel e clicar em **🔴 Encerrar**." }
                ]
            }] } }
        });
    }
};

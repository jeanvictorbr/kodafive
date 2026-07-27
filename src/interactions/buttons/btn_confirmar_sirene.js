const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_confirmar_sirene',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT cargo_alerta_id, nome_faccao FROM server_config WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        const cargoId = config.cargo_alerta_id;
        const nomeFac = config.nome_faccao || 'Facção';
        if (!cargoId) return interaction.reply({ content: '❌ Cargo de alerta não configurado.', flags: 64 });

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 16753920,
                        components: [{ type: 10, content: "# 📡 Disparando alertas..." }]
                    }]
                }
            }
        });

        const role = interaction.guild.roles.cache.get(cargoId);
        if (!role) return;

        const author = interaction.user.tag;
        let enviados = 0;
        let falhas = 0;

        for (const [id, member] of role.members) {
            if (member.user.bot) continue;
            try {
                await member.send(`🚨 **ALERTA DA DIRETORIA**\n\n**Facção:** ${nomeFac}\n**Autor:** ${author}\n\n⚠️ A diretoria da facção convoca todos os membros para uma comunicação urgente. Verifiquem os canais oficiais.\n\n— *KODA STUDIOS*`);
                enviados++;
            } catch {
                falhas++;
            }
            await new Promise(r => setTimeout(r, 300));
        }

        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                body: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 65280,
                        components: [
                            { type: 10, content: `# ✅ Alerta Enviado\n> **Membros notificados:** \`${enviados}\`\n> **Falhas (DM fechada):** \`${falhas}\`` }
                        ]
                    }]
                }
            }
        );
    }
};

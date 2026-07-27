const { pool } = require('../../database/db');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_modulo_sirene',
    async execute(client, interaction) {
        const config = (await pool.query(
            'SELECT cargo_alerta_id, nome_faccao FROM server_config WHERE guild_id = $1',
            [interaction.guildId]
        )).rows[0] || {};

        const cargoId = config.cargo_alerta_id;
        const nomeFac = config.nome_faccao || 'Facção';

        let conteudo = '';
        if (!cargoId) {
            conteudo = '### ⚠️ Cargo de Alerta não configurado\nUse `/kodafive` e vá em **Utilidades** para configurar.';
        } else {
            const role = interaction.guild.roles.cache.get(cargoId);
            const roleName = role ? role.name : 'Cargo removido';
            const members = role ? role.members.size : 0;
            conteudo = `### 📢 Alerta Geral\n**Cargo alvo:** ${role ? `<@&${cargoId}>` : '`Não encontrado`'} (${members} membros)\n\nAo confirmar, o bot enviará uma DM para **todos os membros** com este cargo.\n**Facção:** ${nomeFac}\n\n⚠️ Isso pode levar alguns segundos dependendo da quantidade de membros.`;
        }

        const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });

        const painel = [{
            type: 17,
            accent_color: 16711680,
            components: [
                {
                    type: 9,
                    components: [{ type: 10, content: `# 🚨 ALERTA GERAL\n${conteudo}` }],
                    accessory: { type: 11, media: { url: avatarUrl } }
                },
                ...(cargoId ? [{ type: 14, spacing: 1, divider: true }, {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_confirmar_sirene", label: "🔴 Disparar Alerta", emoji: { name: "🚨" } }
                    ]
                }] : []),
                { type: 14, spacing: 1, divider: true },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, custom_id: "btn_voltar_menu_principal", label: "Voltar ao QG", emoji: { name: "🔙" } }
                    ]
                },
                { type: 10, content: "*💼 KODA STUDIOS • Sistema de Alerta*" }
            ]
        }];

        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

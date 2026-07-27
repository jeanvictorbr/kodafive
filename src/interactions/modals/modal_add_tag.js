const { pool } = require('../../database/db');
const { aplicarTag } = require('../../utils/tagHelper');
const { Routes } = require('discord.js');
const { buildPainelTags } = require('../../utils/buildPainelTags');

module.exports = {
    customId: 'modal_add_tag',
    async execute(client, interaction) {
        const roleId = interaction.customId.replace('modal_add_tag_', '');
        const tag = interaction.fields.getTextInputValue('input_tag').trim();

        if (!tag.startsWith('[') || !tag.endsWith(']')) {
            return interaction.reply({ content: '❌ A tag precisa estar no formato `[TAG]`. Exemplo: `[LIDER]`', flags: 64 });
        }

        if (tag.length > 20) {
            return interaction.reply({ content: '❌ Tag muito longa. Máximo 20 caracteres.', flags: 64 });
        }

        try {
            await pool.query(
                `INSERT INTO cargo_tags (guild_id, cargo_id, tag) VALUES ($1, $2, $3)
                 ON CONFLICT (guild_id, cargo_id) DO UPDATE SET tag = $3`,
                [interaction.guildId, roleId, tag]
            );

            const painel = await buildPainelTags(interaction);

            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 7,
                    data: { flags: 32832, components: painel }
                }
            });

            const members = await interaction.guild.members.fetch();
            for (const [id, member] of members) {
                if (member.user.bot) continue;
                if (member.roles.cache.has(roleId)) {
                    aplicarTag(client, interaction.guildId, id);
                }
            }

        } catch (error) {
            console.error('[TAG] Erro ao salvar tag:', error);
            await interaction.reply({ content: '❌ Erro ao salvar tag no banco.', flags: 64 });
        }
    }
};

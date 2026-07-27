const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelFAQ } = require('../../utils/buildPainelFAQ');

module.exports = {
    customId: 'modal_add_resposta',
    async execute(client, interaction) {
        const palavra = interaction.fields.getTextInputValue('input_palavra').trim().toLowerCase();
        const resposta = interaction.fields.getTextInputValue('input_resposta').trim();

        if (!palavra || !resposta) {
            return interaction.reply({ content: '❌ Preencha todos os campos.', flags: 64 });
        }

        try {
            await pool.query(
                `INSERT INTO auto_resposta (guild_id, palavra_chave, resposta) VALUES ($1, $2, $3)
                 ON CONFLICT (guild_id, palavra_chave) DO UPDATE SET resposta = $3`,
                [interaction.guildId, palavra, resposta]
            );

            const painel = await buildPainelFAQ(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[FAQ] Erro ao salvar resposta:', error);
            await interaction.reply({ content: '❌ Erro ao salvar.', flags: 64 });
        }
    }
};

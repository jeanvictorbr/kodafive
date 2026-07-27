const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelAliancasAdmin } = require('../../utils/buildPainelAliancasAdmin');

module.exports = {
    customId: 'modal_add_alianca',
    async execute(client, interaction) {
        const nome = interaction.fields.getTextInputValue('input_nome').trim();
        const tipo = interaction.fields.getTextInputValue('input_tipo').trim().toLowerCase();
        const desc = interaction.fields.getTextInputValue('input_desc').trim();
        const icone = interaction.fields.getTextInputValue('input_icone').trim();

        if (!nome) return interaction.reply({ content: '❌ Nome é obrigatório.', flags: 64 });
        if (tipo !== 'alianca' && tipo !== 'rival') {
            return interaction.reply({ content: '❌ Tipo deve ser "alianca" ou "rival".', flags: 64 });
        }

        try {
            const count = (await pool.query('SELECT COUNT(*) as total FROM aliancas WHERE guild_id = $1', [interaction.guildId])).rows[0].total;
            await pool.query(
                `INSERT INTO aliancas (guild_id, nome, tipo, descricao, icone_url, posicao) VALUES ($1, $2, $3, $4, $5, $6)`,
                [interaction.guildId, nome, tipo, desc, icone, parseInt(count) + 1]
            );

            const painel = await buildPainelAliancasAdmin(interaction);
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: painel } }
            });
        } catch (error) {
            console.error('[ALIANCAS] Erro:', error);
            await interaction.reply({ content: '❌ Erro ao salvar.', flags: 64 });
        }
    }
};

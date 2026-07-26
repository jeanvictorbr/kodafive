const { pool } = require('../../database/db');
const { Routes } = require('discord.js');
const { buildPainelRH } = require('../../utils/buildPainelRH');

module.exports = {
    customId: 'modal_nome_fac',
    async execute(client, interaction) {
        const novoNome = interaction.fields.getTextInputValue('input_nome_fac');
        await pool.query(
            `INSERT INTO server_config (guild_id, nome_faccao) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET nome_faccao = $2`, 
            [interaction.guildId, novoNome]
        );
        const subModuloRH = await buildPainelRH(interaction);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: subModuloRH } }
        });
    }
};
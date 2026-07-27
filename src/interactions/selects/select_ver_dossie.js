const { buildPainelPerfil } = require('../../utils/buildPainelPerfil');

module.exports = {
    customId: 'select_ver_dossie',
    async execute(client, interaction) {
        const userId = interaction.values[0];
        const painel = await buildPainelPerfil(client, interaction.guildId, userId);
        await interaction.reply({
            flags: 32832,
            components: painel
        });
    }
};

const { buildPainelPerfil } = require('../../utils/buildPainelPerfil');

module.exports = {
    name: 'Dossiê',
    type: 2,
    async execute(client, interaction) {
        const painel = await buildPainelPerfil(client, interaction.guildId, interaction.targetId);
        await interaction.reply({ flags: 32832, components: painel });
    }
};

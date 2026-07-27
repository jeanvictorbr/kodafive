const { Routes } = require('discord.js');
const { isModoGratuito, setModoGratuito } = require('../../utils/vipHelper');
const { buildPainelDev } = require('../../utils/buildPainelDev');

module.exports = {
    customId: 'btn_dev_toggle_gratuito',
    async execute(client, interaction) {
        if (interaction.user.id !== process.env.DEV_ID) {
            return client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: { type: 7, data: { flags: 32832, components: [{
                    type: 17, accent_color: 15548997,
                    components: [
                        { type: 10, content: '# ⛔ Só o desenvolvedor pode usar isso.' }
                    ]
                }] } }
            });
        }

        const ativo = await isModoGratuito();
        await setModoGratuito(!ativo);
        const painel = await buildPainelDev(client);
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 7, data: { flags: 32832, components: painel } }
        });
    }
};

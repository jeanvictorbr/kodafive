const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dev_remover_doados',
    async execute(client, interaction) {
        await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: { type: 6 }
        });

        await client.rest.patch(
            `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                body: {
                    flags: 32832,
                    components: [{
                        type: 17,
                        accent_color: 15548997,
                        components: [
                            { type: 10, content: "### ⚠️ Confirmar — Remover VIPs DOADOS\nTem certeza? Isso removerá VIP de **todos os servidores que receberam VIP por doação**.\n\nServidores com VIP **comprado por key** ou **concedido manualmente** NÃO serão afetados." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [
                                    { type: 2, style: 4, custom_id: "btn_dev_confirm_remover_doados", label: "⛔ Sim, remover doações", emoji: { name: "⛔" } },
                                    { type: 2, style: 3, custom_id: "btn_dev_cancel_remover_doados", label: "❌ Cancelar", emoji: { name: "❌" } }
                                ]
                            }
                        ]
                    }]
                }
            }
        );
    }
};

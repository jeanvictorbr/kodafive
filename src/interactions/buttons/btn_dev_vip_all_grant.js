const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dev_vip_all_grant',
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
                        accent_color: 15844367,
                        components: [
                            { type: 10, content: "### ⚠️ Confirmar — Liberar VIP para TODOS\nTem certeza que deseja conceder VIP para **todos** os servidores onde o bot está?\n\nIsso inclui servidores que **não pagaram** pelo plano." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [
                                    { type: 2, style: 3, custom_id: "btn_dev_confirm_all_grant", label: "✅ Sim, liberar VIP para todos", emoji: { name: "💎" } },
                                    { type: 2, style: 4, custom_id: "btn_dev_cancel_all_grant", label: "❌ Cancelar", emoji: { name: "❌" } }
                                ]
                            }
                        ]
                    }]
                }
            }
        );
    }
};

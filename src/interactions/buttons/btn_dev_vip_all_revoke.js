const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_dev_vip_all_revoke',
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
                            { type: 10, content: "### ⚠️ Confirmar — Remover VIP de TODOS\nTem certeza que deseja remover VIP de **todos** os servidores?\n\nIsso inclui servidores **pagantes** que têm VIP ativo. Ação **irreversível** sem gerar novas keys." },
                            { type: 14, spacing: 1, divider: true },
                            {
                                type: 1,
                                components: [
                                    { type: 2, style: 4, custom_id: "btn_dev_confirm_all_revoke", label: "⛔ Sim, remover VIP de todos", emoji: { name: "⛔" } },
                                    { type: 2, style: 3, custom_id: "btn_dev_cancel_all_revoke", label: "❌ Cancelar", emoji: { name: "❌" } }
                                ]
                            }
                        ]
                    }]
                }
            }
        );
    }
};

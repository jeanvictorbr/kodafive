const { pool } = require('../../database/db');
const { atualizarVitrineFarm } = require('../../utils/vitrineFarm');

module.exports = {
    customId: 'btn_resetar_farm',
    async execute(client, interaction) {
        const metas = await pool.query('SELECT COUNT(*) as total FROM entregas_farm WHERE guild_id = $1 AND status = $2', [interaction.guildId, 'validado']);

        if (parseInt(metas.rows[0].total) === 0) {
            return interaction.reply({ content: '⚠️ Não tem nenhuma entrega validada pra resetar, cria.', flags: 64 });
        }

        await interaction.reply({
            flags: 32832,
            components: [
                {
                    type: 17,
                    accent_color: 15548997,
                    components: [
                        { type: 10, content: "⚠️ **Tem certeza que quer resetar o placar de farm?**\n\nTodas as entregas validadas desse ciclo serão zeradas e o progresso atual perdido. Essa ação **não pode ser desfeita**." },
                        { type: 14, spacing: 1, divider: true },
                        {
                            type: 1,
                            components: [
                                { type: 2, style: 4, custom_id: "btn_confirmar_reset_farm", label: "Sim, Resetar Tudo", emoji: { name: "⚠️" } },
                                { type: 2, style: 2, custom_id: "btn_cancelar_reset_farm", label: "Cancelar", emoji: { name: "❌" } }
                            ]
                        }
                    ]
                }
            ]
        });
    }
};

const { Routes } = require('discord.js');
const { sincronizarTodos } = require('../../utils/tagHelper');
const { buildPainelTags } = require('../../utils/buildPainelTags');

module.exports = {
    customId: 'btn_sync_tags',
    async execute(client, interaction) {
        try {
            await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 4,
                    data: {
                        flags: 32832,
                        components: [
                            {
                                type: 17,
                                accent_color: 16753920,
                                components: [
                                    { type: 10, content: "# 🔄 Sincronização em Andamento\nAnalisando membros um por um. Isso pode levar alguns segundos..." }
                                ]
                            }
                        ]
                    }
                }
            });

            const resultado = await sincronizarTodos(client, interaction);

            const resultadoPainel = [
                {
                    type: 17,
                    accent_color: 65280,
                    components: [
                        { type: 10, content: `# ✅ Sincronização Concluída\n> **Total de membros:** \`${resultado.total}\`\n> **Atualizados:** \`${resultado.atualizados}\`\n> **Ignorados (bots):** \`${resultado.ignorados}\`\n> **Erros:** \`${resultado.erros}\`` }
                    ]
                }
            ];

            await client.rest.patch(
                `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
                { body: { flags: 32832, components: resultadoPainel } }
            );

            await new Promise(r => setTimeout(r, 2000));

            const painelFinal = await buildPainelTags(interaction);
            await client.rest.patch(
                `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
                { body: { flags: 32832, components: painelFinal } }
            );

        } catch (error) {
            console.error('[TAG] Erro na sincronização:', error);
            try {
                await client.rest.patch(
                    `/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
                    { body: { content: '❌ Erro durante a sincronização.', flags: 64 } }
                );
            } catch (_) {}
        }
    }
};

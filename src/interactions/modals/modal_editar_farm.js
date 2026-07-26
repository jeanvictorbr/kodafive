const { atualizarVitrineFarm } = require('../../utils/vitrineFarm'); 

module.exports = {
    customId: 'modal_editar_farm',
    async execute(interaction) {
        const novaMeta = interaction.fields.getTextInputValue('input_nova_meta');
        const nomeItem = interaction.fields.getTextInputValue('input_item_nome');

        // Proteção contra número zoado, mandando Container V2 de Erro
        if (isNaN(novaMeta)) {
            return interaction.reply({ 
                flags: 32832, 
                components: [{
                    type: 17, // Container
                    accent_color: 15548997, // Vermelho perigo
                    components: [{ type: 10, content: '⚠️ **Aí não, chefia!** O valor da meta precisa ser um número inteiro.' }] //
                }]
            });
        }

        // [SEU BANCO AQUI] Salva a nova meta no DB
        // await db.farm.update(...)

        // Responde o líder confirmando a fita (Padrão V2)
        await interaction.reply({
            flags: 32832,
            components: [{
                type: 17, // Container
                accent_color: 5763719,
                components: [{ 
                    type: 10, // TextDisplay
                    content: `✅ **Padrão!** A meta foi atualizada para \`${novaMeta} ${nomeItem}\`.\nO painel da vitrine já refletiu a mudança pra tropa toda.` 
                }]
            }]
        });

        // O SEGREDO DO TEMPO REAL TÁ AQUI:
        // Puxa a função e atualiza a mensagem original no chat automaticamente
        await atualizarVitrineFarm(interaction.client, interaction.guild.id);
    }
};
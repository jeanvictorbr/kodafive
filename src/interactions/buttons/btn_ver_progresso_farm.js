module.exports = {
    customId: 'btn_ver_progresso_farm',
    async execute(client, interaction) {
        // [SEU BANCO AQUI] Puxa a cota individual do cria
        const userId = interaction.user.id;
        const farmMembro = { entregue: 20, item: 'Pacotes' };

        // Resposta Efêmera no Padrão V2
        // Flags: 32768 (V2) + 64 (Ephemeral) = 32832
        await interaction.reply({
            flags: 32832, 
            components: [
                {
                    type: 17, // Container
                    accent_color: 5763719, // Verde sucesso
                    components: [
                        {
                            type: 10, // TextDisplay
                            content: `📊 **Visão do seu corre:** Você já entregou \`${farmMembro.entregue} ${farmMembro.item}\` neste ciclo.\n\nMarcha, continua macetando!`
                        }
                    ]
                }
            ]
        });
    }
};
const fs = require('fs');
const path = require('path');
const { importarConfig } = require('../../utils/backupHelper');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_importar_backup',
    async execute(client, interaction) {
        if (interaction.user.id !== process.env.DEV_ID) {
            return interaction.reply({ content: '❌ Apenas o desenvolvedor.', flags: 64 });
        }

        await interaction.reply({
            content: '📂 Envie o arquivo **.json** de backup neste chat para importar.\n⏳ Você tem 60 segundos.',
            flags: 64
        });

        const filter = msg => msg.author.id === interaction.user.id && msg.attachments.size > 0 && msg.attachments.first().name.endsWith('.json');
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async msg => {
            try {
                const attachment = msg.attachments.first();
                const res = await fetch(attachment.url);
                const data = await res.json();

                if (!data.version || !data.guild_id) {
                    return interaction.editReply({ content: '❌ Arquivo de backup inválido.', flags: 64 });
                }

                const resultado = await importarConfig(client, interaction.guildId, data);
                await interaction.editReply({
                    content: `✅ **Importação concluída!**\n> **Importados:** \`${resultado.sucessos}\`\n> **Erros:** \`${resultado.erros}\``,
                    flags: 64
                });
            } catch (error) {
                console.error('[BACKUP] Erro ao importar:', error);
                await interaction.editReply({ content: '❌ Erro ao processar o arquivo.', flags: 64 });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: '⏰ Tempo esgotado. Nenhum arquivo recebido.', flags: 64 }).catch(() => {});
            }
        });
    }
};

const { exportarConfig } = require('../../utils/backupHelper');
const { Routes } = require('discord.js');

module.exports = {
    customId: 'btn_exportar_backup',
    async execute(client, interaction) {
        if (interaction.user.id !== process.env.DEV_ID) {
            return interaction.reply({ content: '❌ Apenas o desenvolvedor.', flags: 64 });
        }

        await interaction.reply({ content: '📦 Exportando configurações...', flags: 64 });

        try {
            const data = await exportarConfig(interaction.guildId);
            const json = JSON.stringify(data, null, 2);
            const buffer = Buffer.from(json, 'utf-8');

            const channel = await client.channels.fetch(interaction.channelId);
            await channel.send({
                content: `📦 **Backup das configurações** — ${new Date().toLocaleString()}`,
                files: [{ attachment: buffer, name: `backup_${interaction.guildId}_${Date.now()}.json` }]
            });

            await interaction.editReply({ content: '✅ Backup exportado com sucesso!', flags: 64 });
        } catch (error) {
            console.error('[BACKUP] Erro ao exportar:', error);
            await interaction.editReply({ content: '❌ Erro ao exportar backup.', flags: 64 });
        }
    }
};

// src/interactions/buttons/btn_ponto_sair.js
const { pool } = require('../../database/db');

module.exports = {
    customId: 'btn_ponto_sair',
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        try {
            // Puxa o ponto aberto do usuário
            const aberto = await pool.query(
                "SELECT id, entrada FROM bate_ponto WHERE guild_id = $1 AND user_id = $2 AND status = 'aberto' ORDER BY id DESC LIMIT 1", 
                [guildId, userId]
            );

            if (aberto.rows.length === 0) {
                return interaction.reply({ content: '⚠️ Você não bateu ponto de entrada ainda ou já finalizou seu turno!', flags: 64 });
            }

            const pontoId = aberto.rows[0].id;
            const entradaTime = new Date(aberto.rows[0].entrada);
            const saidaTime = new Date();

            // Fecha o ponto no banco
            await pool.query(
                "UPDATE bate_ponto SET saida = CURRENT_TIMESTAMP, status = 'fechado' WHERE id = $1", 
                [pontoId]
            );

            // Calcula a diferença em segundos
            const diffSegundos = Math.floor((saidaTime - entradaTime) / 1000);
            const horas = Math.floor(diffSegundos / 3600);
            const minutos = Math.floor((diffSegundos % 3600) / 60);

            // Responde o usuário de forma privada (evitando o erro de InteractionAlreadyReplied)
            await interaction.reply({ content: `🔴 **Serviço finalizado!** Você trabalhou \`${horas}h ${minutos}m\` nesse turno. Relatório enviado pro QG.`, flags: 64 });

            // Busca o canal de relatórios configurado no Dashboard
            const config = await pool.query('SELECT canal_ponto_id, nome_faccao FROM server_config WHERE guild_id = $1', [guildId]);
            const canalPontoId = config.rows[0]?.canal_ponto_id;
            const nomeFac = config.rows[0]?.nome_faccao || 'Nossa Facção';

            if (canalPontoId) {
                const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });
                
                // Monta o Embed Profissional Padrão Koda para o canal de texto
                const embedRelatorio = {
                    color: 0x3498db, // Azul corporativo
                    title: `⏱️ Relógio de Ponto | ${nomeFac}`,
                    description: `O membro encerrou o expediente e a carga horária foi contabilizada com sucesso no sistema.`,
                    fields: [
                        { name: "👤 Membro", value: `<@${userId}>`, inline: true },
                        { name: "⏳ Tempo Trabalhado", value: `\`${horas}h ${minutos}m\``, inline: true },
                        { name: "🕒 Entrada / Saída", value: `De \`${entradaTime.toLocaleTimeString()}\` até \`${saidaTime.toLocaleTimeString()}\``, inline: false }
                    ],
                    thumbnail: { url: avatarUrl },
                    footer: { text: "KODA STUDIOS • Sistema de Gestão Inteligente" }
                };

                const canal = client.channels.cache.get(canalPontoId);
                if (canal) {
                    await canal.send({ embeds: [embedRelatorio] });
                }
            }

        } catch (error) {
            console.error('[ERRO] Falha ao finalizar ponto:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Deu ruim ao registrar sua saída.', flags: 64 });
            }
        }
    }
};
const { pool } = require('../database/db');

const TAG_PATTERN = /^\[.*?\]\s*/;
const MAX_NICK_LENGTH = 100;

function removerTag(nome) {
    return nome.replace(TAG_PATTERN, '').trim();
}

async function getMembers(guild) {
    if (guild.members.cache.size > 0) {
        return guild.members.cache;
    }
    try {
        return await guild.members.fetch();
    } catch (error) {
        console.error('[TAG] Erro ao buscar membros via gateway, usando cache:', error.message);
        return guild.members.cache;
    }
}

async function aplicarTag(client, guildId, userId) {
    try {
        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return { aplicado: false, motivo: 'guild_nao_encontrada' };

        const member = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
        if (!member || member.user.bot) return { aplicado: false, motivo: 'membro_invalido' };

        const configs = await pool.query(
            'SELECT cargo_id, tag FROM cargo_tags WHERE guild_id = $1',
            [guildId]
        );

        if (configs.rows.length === 0) return { aplicado: false, motivo: 'sem_config' };

        const memberRoleIds = [...member.roles.cache.keys()];

        const tagsValidas = configs.rows
            .map(r => ({
                cargo_id: r.cargo_id,
                tag: r.tag,
                posicao: guild.roles.cache.get(r.cargo_id)?.position ?? -1
            }))
            .filter(r => r.posicao >= 0 && memberRoleIds.includes(r.cargo_id))
            .sort((a, b) => b.posicao - a.posicao);

        const nomeAtual = member.nickname || member.user.displayName;
        const nomeLimpo = removerTag(nomeAtual);

        if (tagsValidas.length === 0) {
            if (nomeLimpo !== nomeAtual) {
                await member.setNickname(nomeLimpo).catch(() => {});
                return { aplicado: true, tag: null, nome: nomeLimpo };
            }
            return { aplicado: false, motivo: 'sem_tag' };
        }

        const { tag } = tagsValidas[0];
        let novoNome = `${tag} ${nomeLimpo}`;

        if (novoNome.length > MAX_NICK_LENGTH) {
            const limiteNome = MAX_NICK_LENGTH - tag.length - 1;
            novoNome = `${tag} ${nomeLimpo.substring(0, limiteNome)}`;
        }

        if (novoNome !== nomeAtual) {
            await member.setNickname(novoNome).catch(() => {});
            return { aplicado: true, tag, nome: novoNome };
        }

        return { aplicado: false, motivo: 'ja_atualizado' };
    } catch (error) {
        if (error.code === 50013) return { aplicado: false, motivo: 'sem_permissao' };
        console.error('[TAG] Erro em aplicarTag:', error);
        return { aplicado: false, motivo: 'erro' };
    }
}

async function sincronizarTodos(client, interaction) {
    const guild = interaction.guild;
    const members = await getMembers(guild);
    let atualizados = 0;
    let erros = 0;
    let semPermissao = 0;
    let ignorados = 0;

    for (const [id, member] of members) {
        if (member.user.bot) { ignorados++; continue; }
        const result = await aplicarTag(client, guild.id, id);
        if (result.aplicado) atualizados++;
        if (result.motivo === 'sem_permissao') semPermissao++;
        if (result.motivo === 'erro') erros++;
        await new Promise(r => setTimeout(r, 150));
    }

    return { atualizados, erros, semPermissao, ignorados, total: members.size };
}

module.exports = { aplicarTag, sincronizarTodos, removerTag, getMembers };

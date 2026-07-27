const { adicionarXP } = require('../utils/xpHelper');

const conexoesVoz = new Map();

module.exports = async (client, oldState, newState) => {
    const userId = newState.member?.id || oldState.member?.id;
    if (!userId || newState.member?.user?.bot) return;
    const guildId = newState.guild.id;

    const entrou = !oldState.channelId && newState.channelId;
    const saiu = oldState.channelId && !newState.channelId;

    if (entrou) {
        conexoesVoz.set(`${guildId}-${userId}`, Date.now());
    }

    if (saiu) {
        const entrada = conexoesVoz.get(`${guildId}-${userId}`);
        if (entrada) {
            const minutos = Math.floor((Date.now() - entrada) / 60000);
            if (minutos >= 1) {
                const xp = Math.min(minutos, 60);
                await adicionarXP(guildId, userId, xp);
            }
            conexoesVoz.delete(`${guildId}-${userId}`);
        }
    }
};

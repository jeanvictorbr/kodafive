const { aplicarTag } = require('../utils/tagHelper');

module.exports = async (client, oldMember, newMember) => {
    if (newMember.user.bot) return;

    const oldRoles = [...oldMember.roles.cache.keys()].sort().join(',');
    const newRoles = [...newMember.roles.cache.keys()].sort().join(',');
    if (oldRoles === newRoles) return;

    await aplicarTag(client, newMember.guild.id, newMember.id);
};

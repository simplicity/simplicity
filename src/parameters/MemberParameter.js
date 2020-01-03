'use strict';

const UserParameter = require('./UserParameter');
const CommandError = require('@command/CommandError');

class MemberParameter extends UserParameter {
  static parseOptions(options) {
    return Object.assign({
      ...super.parseOptions(options),
      botRoleHighest: true,
      userRoleHighest: true,
      canBeGuildOwner: true,
      canBeAuthor: false,
    }, options);
  }

  static parseMessageErrors(options) {
    return Object.assign({
      ...super.parseMessageErrors(options),
      botRoleHighest: 'errors:clientMissingRole',
      userRoleHighest: 'errors:userMissingRole',
      canBeGuildOwner: 'errors:noGuildOwner',
      canBeAuthor: 'errors:cantApplyOnAuthor',
    }, options.errors);
  }

  static async verifyExceptions(member, options = {}, { guild, memberAuthor, commandName }) {
    options = this.setupOptions(options);
    await super.verifyExceptions(member.user, options, { author: memberAuthor.user });
    const userOwner = member.id === guild.owner.id;
    const canBeAuthor = options.canBeAuthor && member.id === memberAuthor.id;

    if (!options.canBeGuildOwner && userOwner) throw new CommandError(options.errors.canBeGuildOwner);
    if ((!options.userRoleHighest && member.roles.highest.position >= memberAuthor.roles.highest.position) &&
      !userOwner && canBeAuthor) throw new CommandError(options.errors.userRoleHighest, { commandName });
    if (options.botRoleHighest && !userOwner &&
      guild.me.roles.highest.position <= member.roles.highest.position) throw new CommandError(
      options.errors.botRoleHighest, { commandName },
    );

    return member;
  }

  static async search(query, { guild, client }, options = {}) {
    options = this.setupOptions(options);
    const user = await super.search(query, { guild, client }, options);

    return (user && guild.member(user)) || null;
  }
}

module.exports = MemberParameter;

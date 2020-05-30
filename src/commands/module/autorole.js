'use strict';

const Arguments = require('@arguments');
const { Command, CommandError } = require('@structures');

class AutoRole extends Command {
  constructor(client) {
    super(client, {
      aliases: ['roleauto', 'joinrole'],
      category: 'module',
      cooldown: 5000,
      name: 'autorole',
      requirements: {
        guildOnly: true,
        permissions: ['MANAGE_GUILD'],
        requireDatabase: true,
      },
    },
    );
  }

  async run({ channel, database, guild, guildData, query, t }) {
    if (!query && !guildData.autrole) {
      throw new CommandError('commands:autorole.requireRole', { onUsage: true });
    }

    if (!query && guildData.autrole) {
      await database.guilds.edit(guild.id, { autorole: null });
      return channel.send(t('commands:autorole.disabled'));
    }

    const role = await Arguments.role.parse.call(
      { clientHasHigh: true, required: true },
      query,
      { guild },
    );

    if (guildData.autorole === role.id) {
      throw new CommandError('commands.autorole.isCurrentRole');
    }

    await database.guilds.edit(guild.id, { autorole: role.id });
    if (!guildData.autrole) channel.send(t('commands:autorole.enabled', { role: role.name }));
    else channel.send(t('commands:autorole.changed', { role: role.name }));
  }
}

module.exports = AutoRole;

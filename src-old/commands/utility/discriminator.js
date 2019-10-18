'use strict';

const { Command, CommandError, SimplicityEmbed, Utils: { getServerIconURL } } = require('../../');

class Discriminator extends Command {
  constructor(client) {
    super(client, {
      name: 'discriminator',
      aliases: ['discrim'],
      category: 'util',
      requirements: {
        guildOnly: true,
      },
    });
  }

  run({ author, guild, query, send, t }) {
    const discrim = (query && query.replace(/#/g, '')) || author.discriminator;

    const users = guild.members.filter((m) => m.user.discriminator === discrim);
    const mapped = users && users.map((u) => u.user.tag);
    const final = mapped && mapped.slice(0, 25).join('\n') + (mapped.size > 25 ? '...' : '');
    if (!users || !users.size || !mapped || !final) throw new CommandError('commands:discriminator.nobody');

    const embed = new SimplicityEmbed({ author, t }, { autoAuthor: false })
      .setAuthor('commands:discriminator.users', getServerIconURL(guild), null, { discrim })
      .setDescription(final);
    return send(embed);
  }
}

module.exports = Discriminator;
const { MessageEmbed } = require('discord.js')
const Command = require('../structures/Command')

class Unban extends Command {
  constructor (client) {
    super(client)
    this.aliases = ['ub']
    this.description = 'This command lets you unban members from your server.'
    this.usage = `Usage: **${process.env.PREFIX + this.name} [mention/id] <reason>**`
    this.category = 'Moderation'
    this.argsRequired = true
    this.permissions = ['BAN_MEMBERS']
    this.clientPermissions = ['BAN_MEMBERS']
  }
  run (message, args) {
    let reason = args.slice(1).join(' ')
    let member = this.getUser(message, args)
    let msg, title
    const embed = new MessageEmbed()
      .setAuthor(message.author.usermessage.author.displayAvatarURL({ size: 2048 }))
      .setTimestamp()
      .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL({ size: 2048 }))
      .setColor('RED')
      .setTitle('Denied!')

    if (!member) {
      msg = `Usage: **${process.env.PREFIX}ban [@mention/id] <reason>**`
      title = 'You didn\'t mention / used a valid ID!'
    } else if (message.member.roles.highest.position <= member.roles.highest.position) {
      msg = 'You can\'t ban this user because they have the same or higher role as you.'
    } else if (message.guild.me.roles.highest.position <= member.roles.highest.position) {
      msg = 'I can\'t ban this user because they have the same or higher role as me.'
    } else {
      member.ban({ days: 7, reason: reason || 'No reason given.' })
      title = 'Member Banned'
      msg = `${member} has been banned from the server`
      embed.addField('Banned by:', message.author, true)
        .addField(`Reason: `, reason || 'No reason given.')
        .setThumbnail(message.author.displayAvatarURL())
    }
    if (msg) embed.setDescription(msg)
    if (title) embed.setTitle(title)
    message.channel.send(embed)
  }

  getUser (message, [query = null]) {
    let member = message.mentions.members.first()
    let checkMention = new RegExp('(^<@[0-9]*>)', 'g').test(query)
    if (member && checkMention) {
      return member
    }
    member = message.guild.member(query)
    if (member) {
      return member
    }
  }
}
module.exports = Unban

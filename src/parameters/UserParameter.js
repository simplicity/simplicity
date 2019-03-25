const { CommandError } = require('../')
const Parameter = require('../structures/Parameter')
const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/
class UserParameter extends Parameter {
  static parseOptions (options) {
    return Object.assign({
      ...super.parseOptions(options),
      acceptSelf: true,
      acceptBot: true,
      acceptUser: true,
      errors: {
        acceptBot: 'errors:acceptBot',
        acceptSelf: 'acceptSelf',
        acceptUser: 'acceptUser'
      }
    })
  }

  static verifyExceptions (user, { author }, exeptions = {}) {
    exeptions = this.parseOptions(exeptions)
    if (!exeptions.acceptSelf && user.id === author.id) throw new CommandError(exeptions.errors.acceptSelf, { onUsage: true })
    if (!exeptions.acceptBot && user.bot) throw new CommandError(exeptions.errors.acceptBot, { onUsage: true })
    if (!exeptions.acceptUser && !user.bot) throw new CommandError(exeptions.errors.acceptSelf, { onUsage: true })

    return user
  }

  static async search (query, { client, guild }, options) {
    options = this.parseOptions(options)
    if (!query || typeof query !== 'string') return
    const regexResult = client && MENTION_REGEX.exec(query)
    const id = regexResult && regexResult[0]
    const fetchID = id && (client.users.get(id) || (options.checkGlobally && (await client.users.fetch(id, true).catch(() => null))))
    const findName = guild && guild.members.find((m) => m.user.username.toLowerCase() === query.toLowerCase())
    const findNick = guild && guild.members.find((m) => m.displayName.toLowerCase() === query.toLowerCase())
    const findStartName = guild && guild.members.find((m) => m.user.username.toLowerCase().startsWith(query.toLowerCase()))
    const findStartNick = guild && guild.members.find((m) => m.displayName.toLowerCase().startsWith(query.toLowerCase()))

    return fetchID || (findName && findName.user) || (findNick && findNick.user) || (findStartName && findStartName.user) || (findStartNick && findStartNick.user) || null
  }
}

module.exports = UserParameter

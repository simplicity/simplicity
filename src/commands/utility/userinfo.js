const { Command, Embed, Constants: { SPOTIFY_LOGO_PNG }, Parameters: { UserParameter } } = require('../../')
const { MessageAttachment } = require('discord.js')
const moment = require('moment')

const nameAttachment = 'spotify-logo.png'
const spotifyAttachment = new MessageAttachment(SPOTIFY_LOGO_PNG, nameAttachment)

class UserInfo extends Command {
  constructor (client) {
    super(client)
    this.aliases = ['ui', 'user']
    this.category = 'util'
    this.requirements = { clientPermissions: ['EMBED_LINKS'] }
  }

  async run ({ author, channel, client, guild, send, t, query, emoji }) {
    const user = (!query ? author : await UserParameter.parse(query, { client, guild }, {
      errors: { missingError: 'errors:invalidUser' },
      required: true
    }))

    const member = guild && guild.member(user)

    const presence = client.users.has(user.id) && user.presence
    const status = presence && presence.status

    const created = moment(user.createdAt)
    const joined = member && moment(member.joinedAt)

    const embed = new Embed({ author, t, emoji, autoAuthor: false })
      .setAuthor(user.tag, user.displayAvatarURL())
      .setThumbnail(user.displayAvatarURL())
      .addField('commands:userinfo.name', user.tag, true)
      .addField('commands:userinfo.id', user.id, true)

    if (status) embed.addField('commands:userinfo.status', `#${presence.status} $$utils:status.${presence.status}`, true)

    embed.addField('commands:userinfo.createdAt', `${created.format('LL')} (${created.fromNow()})`)

    if (joined) embed.addField('commands:userinfo.joinedAt', `${joined.format('LL')} (${joined.fromNow()})`)

    const msg = await send(embed)

    const perms = channel.permissionsFor(guild.me)
    const activity = presence && presence.activity
    const restriction = activity && (activity.type === 'LISTENING') && activity.party && activity.party.id && activity.party.id.includes('spotify:')
    console.log(presence.activity)
    if (perms.has('ADD_REACTIONS') && restriction && !user.bot) {
      const spotifyEmoji = emoji('SPOTIFY', { id: true, othur: 'MUSIC' })
      const userinfoEmoji = emoji('PAGE', { id: true })

      await msg.react(spotifyEmoji)
      await msg.react(userinfoEmoji)

      const trackName = activity.details
      const artist = activity.state
      const album = activity.assets && activity.assets.largeText
      const image = activity.assets && activity.assets.largeImage && `https://i.scdn.co/image/${activity.assets.largeImage.replace('spotify:', '')}`

      const spotifyEmbed = new Embed({ author, t })
        .attachFiles(spotifyAttachment)
        .setTitle('commands:userinfo.spotify')
        .setImage('attachment://' + nameAttachment)
        .addField('commands:userinfo.track', trackName, true)
        .addField('commands:userinfo.artist', artist, true)
        .addField('commands:userinfo.album', album, true)
        .setColor('GREEN')
      if (image) spotifyEmbed.setThumbnail(image)

      const filter = (r, u) => r.me && author.id === u.id
      const collector = await msg.createReactionCollector(filter, { errors: ['time'], time: 30000 })

      collector.on('collect', async ({ emoji, users }) => {
        const name = emoji.id || emoji.name
        if (perms.has('MANAGE_MESSAGES')) users.remove(user.id)
        if (name === spotifyEmoji) await msg.edit(spotifyEmbed)
        if (name === userinfoEmoji) await msg.edit(embed)
      })
      collector.on('end', () => {
        if (msg) msg.reactions.removeAll()
      })
    }
  }
}

module.exports = UserInfo

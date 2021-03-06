'use strict';

const Config = require('@data/config');
const LogUtil = require('@util/LogUtil');
const i18next = require('i18next');
const SimplicityEmbed = require('./SimplicityEmbed');

/**
 * Main Listener class.
 * @class SimplicityListener
 */
class SimplicityListener {
  /**
   * Creates an instance of SimplicityListener.
   * @param {Client} client The Listener's Client.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * What gets ran when the event is triggered.
   * @returns {void}
   */
  on() {
    throw new Error(`${this.constructor.name} doesn't have an on() method.`);
  }

  /**
   * Gets the language for a guild.
   * @param {string} guildID The ID of the guild.
   * @returns {i18next} The language object.
   */
  async getFixedT(guildID) {
    const guild = this.client && guildID && this.client.guilds.cache.get(guildID);
    const guildData = guild && this.database && await this.database.guilds.cache.get(guildID);
    const language = (guildData && guildData.language) || 'en-US';
    return i18next.getFixedT(language);
  }

  /**
   * Sends a message to the logging channel of a guild.
   * @param {string} guildID The ID of the guild.
   * @param {string} log The name of the log.
   * @param {MessageEmbed|string} content The content to send.
   * @returns {void}
   */
  async sendLogMessage(guildID, log, content) {
    const channelData = await this.getLogOptions(guildID, log);
    if (channelData) {
      if (content instanceof SimplicityEmbed) content.setTranslator(channelData.t);
      LogUtil.send(channelData.channel, content).catch(() => null);
    }
  }

  /**
   * Sends a private message using an ENV variable.
   * @param {string} envName The name of the env variable.
   * @param {MessageEmbed|string} content The content to send.
   * @returns {boolean|Promise<Message>} The message sent or false.
   */
  sendPrivateMessage(envName, content) {
    const id = envName && Config[envName.toUpperCase()];
    const channel = this.client && id && this.client.channels.cache.get(id);
    if (channel) return channel.send(content);
  }
}

module.exports = SimplicityListener;

'use strict';

const { LANGUAGE, PREFIX } = require('@data/config');

module.exports = {
  guilds: {
    _id: { required: true, type: String },
    autorole: { default: false, type: String },
    disableChannels: { type: Array },
    lang: { default: LANGUAGE, type: String },
    logs: {
      GuildMemberAdd: { default: null, type: String },
      GuildMemberRemove: { default: null, type: String },
      GuildUpdates: { default: null, type: String },
      MessageUpdate: { default: null, type: String },
      UserUpdate: { default: null, type: String },
      VoiceChannelLogs: { default: null, type: String },
    },
    prefix: { default: PREFIX, type: String },
    starboard: { default: null, type: String },
  },
  joinLeaveGuild: {
    date_at: { required: true, type: Date },
    guild_id: { required: true, type: String },
    type: { enum: ['JOIN', 'LEAVE'], required: true, type: String },
  },
};

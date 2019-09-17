'use strict';


class CommandCooldown extends Map {
  constructor(cooldown) {
    super();
    this.cooldown = cooldown;
  }

  isCooldown(userID) {
    const user = this.get(userID);
    if (!user) return 'continue';

    const time = Date.now() - user.timestamp;
    if (this.cooldown > time && user.ratelimit < 3) {
      user.ratelimit += 1;
      this.set(userID, user);
      return this.cooldown - time;
    } else if (this.cooldown < time) {
      this.delete(userID);
      return 'continue';
    } else if (user.ratelimit >= 3) return 'ratelimit';
  }

  toMessage(timestamp, t) {
    const date = new Date(timestamp);
    let time = '';

    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (minutes) time += t('common:minutes', { minutes });
    if (minutes && seconds) time += t('common:and');
    if (seconds) time += t('common:seconds', { seconds });

    const message = t('common:cooldown', { time: time || t('common:waitLittleTime') });
    return message;
  }

  add(userID) {
    return this.set(userID, { timestamp: Date.now(), ratelimit: 0 });
  }
}

module.exports = CommandCooldown;
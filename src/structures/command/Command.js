'use strict';

const { PermissionUtil: { verifyDev } } = require('@util');
const CommandCooldown = require('./CommandCooldown');
const CommandError = require('./CommandError');
const CommandRequirements = require('./CommandRequirements');
const CommandParameters = require('./parameters/CommandParameters');

class Command {
  constructor(client, options = {}, parameters = []) {
    this.client = client;
    this.parameters = parameters;
    this.setup(options);
  }

  setup(options) {
    if (!options.name) throw new Error(`${this.constructor.name} doesn't have name`);
    if (!options.category) throw new Error(`${this.constructor.name} doesn't have category`);

    this.name = options.name;
    this.category = options.category;
    this.aliases = options.aliases || [];
    this.requirements = options.requirements;
    this.argRequireResponse = options.argRequiredResponse;
    this.subcommands = options.subcommands || [];
    this.cooldown = options.cooldown || process.env.COMMAND_COOLDOWN || 10000;
    this.usersCooldown = this.cooldown > 0 ? new CommandCooldown(this.cooldown) : null;
  }

  run() {
    throw new Error(`${this.constructor.name} doesn't have a run() method.`);
  }

  async _run(ctx, args) {
    let inCooldown = true;
    const isDev = verifyDev(ctx.author.id, ctx.client);
    try {
      if (!isDev && this.usersCooldown) {
        const cooldown = await this.runCooldown(ctx.author.id, ctx.t);
        if (cooldown === 'continue') inCooldown = false;
        if (cooldown === 'ratelimit') return;
      }

      const [subcmd] = ctx.args;
      const subcommand = subcmd && this.getSubCommand(subcmd.toLowerCase());
      if (subcommand) return await this.runSubCommand(subcommand, ctx);

      if (this.requirements) {
        await CommandRequirements.handle(ctx, this.requirements, this.argRequireResponse);
      }

      if (this.parameters) {
        args = await CommandParameters.handle(ctx, this.parameters, args);
      }

      await this.run(ctx, ...args);
    } catch (error) {
      this.client.emit('commandError', error, ctx);
    } finally {
      if (!isDev && this.usersCooldown && !inCooldown) this.usersCooldown.add(ctx.author.id);
    }
  }

  runCooldown(userID, t) {
    const isCooldown = this.usersCooldown.isCooldown(userID);
    if (isCooldown === 'continue') return 'continue';
    else if (isCooldown === 'ratelimit') return 'ratelimit';
    else throw new CommandError(this.usersCooldown.toMessage(isCooldown, t), { notEmbed: true });
  }

  getSubCommand(name) {
    return this.subcommands.find((i) => i.name === name || (Array.isArray(i.aliases) && i.aliases.includes(name)));
  }

  runSubCommand(subcommand, context) {
    context.query = context.query.replace(`${context.args[0]} `, '').slice(1);
    context.args = context.args.slice(1);
    return subcommand._run(context);
  }
}

module.exports = Command;

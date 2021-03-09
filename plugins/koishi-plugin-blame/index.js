const defaultOptions = {
  catch: ["unhandledRejection", "uncaughtException"], // useful catches: ['uncaughtException', 'unhandledRejection']
  send: {
    private: [], // ["onebot:1919810", "khl:ffff"],
    group: [],
    channel: [],
  },
  sender: [], // ["onebot:114514", "khl:dddd"],
};
const handler = (err, send) => send(err);

let installed = false;

// module.exports.name = "blame";
module.exports.v1 = {
  name: "blame-koishi-v1",
  apply(ctx, options) {
    if (installed) return;

    options = { ...defaultOptions, ...options };
    if (!options.send.private) options.send.private = [];
    if (!options.send.group) options.send.group = [];

    const sendPrivate = (message) =>
      options.send.private.map((id) =>
        ctx.sender.sendPrivateMsg(id, message.toString())
      );
    const sendGroup = (message) =>
      options.send.group.map((id) =>
        ctx.sender.sendGroupMsg(id, message.toString())
      );

    options.catch.map((c) => {
      process.on(c, (reason, origin) => {
        handler(`${reason.stack}`, sendPrivate);
        handler(`${reason.stack}`, sendGroup);
      });
    });

    installed = true;
  },
};

module.exports.v2 = {
  name: "blame-koishi-v2",
  apply(ctx, options) {
    if (installed) return;

    options = { ...defaultOptions, ...options };
    if (!options.send.private) options.send.private = [];
    if (!options.send.group) options.send.group = [];

    const bot = ctx.bots.find((bot) => bot);

    const sendPrivate = (message) =>
      options.send.private.map((id) =>
        bot.sendPrivateMsg(id, message.toString())
      );
    const sendGroup = (message) =>
      options.send.group.map((id) => bot.sendGroupMsg(id, message.toString()));

    options.catch.map((c) => {
      process.on(c, (reason, origin) => {
        handler(`${reason.stack}`, sendPrivate);
        handler(`${reason.stack}`, sendGroup);
      });
    });
    installed = true;
  },
};

module.exports.v3 = {
  name: "blame-koishi-v3",
  apply(ctx, options) {
    if (installed) return;

    const findSamePlatformBots = (platform) =>
      ctx.bots.filter((bot) => bot.platform === platform);

    const logger = ctx.logger("blame");
    const console = {
      ...logger,
      log: (...content) => logger.info(...content),
    };

    // merge options with default options
    options = { ...defaultOptions, ...options };
    if (!options.send.private) options.send.private = [];
    if (!options.send.group) options.send.group = [];
    if (!options.send.channel) options.send.channel = [];

    const concatGroupAndChannel = () => [
      ...options.send.group,
      ...options.send.channel,
    ];

    // notify api change
    if (options.send.group.length)
      console.log(
        "please use `options.send.channel` instead of `options.send.group`"
      );

    const sendPrivate = (message) => {
      options.send.private.map((ptId) => {
        const [platform, id] = ptId.split(":");
        if (!id) throw new Error("v3 needs `platform:id` as a receiver id");
        const samePlatformBots = findSamePlatformBots(platform);

        const bot =
          options.sender.find((sender) =>
            samePlatformBots.find(
              (bot) => `${bot.platform}:${bot.id}` === sender
            )
          ) || ctx.bots.find((bot) => bot.platform === platform); // find specified sender bot or choose a bot on same platform

        bot.sendPrivateMessage(id.toString(), message.toString());
      });
    };

    const sendGroup = (message) => {
      concatGroupAndChannel().map((ptId) => {
        const [platform, id] = ptId.split(":");
        if (!id) throw new Error("v3 needs `platform:id` as a receiver id");
        const samePlatformBots = findSamePlatformBots(platform);

        const bot =
          options.sender.find((sender) =>
            samePlatformBots.find(
              (bot) => `${bot.platform}:${bot.id}` === sender
            )
          ) || ctx.bots.find((bot) => bot.platform === platform); // find specified sender bot or choose a bot on same platform

        bot.sendGroupMessage(id.toString(), message.toString());
      });
    };

    options.catch.map((c) => {
      process.on(c, (reason, origin) => {
        handler(`${reason.stack}`, sendPrivate);
        handler(`${reason.stack}`, sendGroup);
      });
    });
    installed = true;
  },
};

const { version } = require('koishi-core')
const [ major ] = version.split('.')

const availableVersions = Object.keys(module.exports).filter(k => k.startsWith('v'))
const suitableVersion = availableVersions.find(available => available === `v${major}`)
if (!suitableVersion) {
  module.exports.name = 'blame'
  module.exports.apply = (ctx) => {
    ctx.logger('blame').error('no suitable version found. try choose a sub plugin (require(\'koishi-plugin-blame\').v2) manually.')
    ctx.logger('blame').error('there might be an update for this plugin, try update dependencies.')
  }
}

module.exports = module.exports[`v${major}`]
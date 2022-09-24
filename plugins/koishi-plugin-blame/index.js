// @ts-check
const defaultOptions = {
  catch: ['unhandledRejection', 'uncaughtException'], // useful catches: ['uncaughtException', 'unhandledRejection']
  send: {
    private: [], // ["onebot:1919810", "khl:ffff"],
    group: [],
    channel: []
  },
  sender: [] // ["onebot:114514", "khl:dddd"],
}
const handler = (err, send) => send(err)
const crash = (code = 1) => {
  console.error('EMERGENCY LANDING!!!')
  process.exit(code)
}

const loopProtector = () => {
  let lastError = undefined
  return (err) => {
    if (lastError === err) {
      return true
    } else {
      lastError = err
    }
  }
}

let installed = false

// module.exports.name = "blame";
module.exports.v1 = {
  name: 'blame-koishi-v1',
  apply(ctx, options) {
    if (installed) return

    options = { ...defaultOptions, ...options }
    if (!options.send.private) options.send.private = []
    if (!options.send.group) options.send.group = []

    const sendPrivate = (message) =>
      options.send.private.map((id) =>
        ctx.sender.sendPrivateMsg(id, message.toString())
      )
    const sendGroup = (message) =>
      options.send.group.map((id) =>
        ctx.sender.sendGroupMsg(id, message.toString())
      )

    options.catch.forEach((c) => {
      process.on(c, (reason, origin) => {
        handler(`${reason.stack}`, sendPrivate)
        handler(`${reason.stack}`, sendGroup)
      })
    })

    installed = true
  }
}

module.exports.v2 = {
  name: 'blame-koishi-v2',
  apply(ctx, options) {
    if (installed) return

    options = { ...defaultOptions, ...options }
    if (!options.send.private) options.send.private = []
    if (!options.send.group) options.send.group = []

    const bot = ctx.bots.find((bot) => bot)

    const sendPrivate = (message) =>
      options.send.private.map((id) =>
        bot.sendPrivateMsg(id, message.toString())
      )
    const sendGroup = (message) =>
      options.send.group.map((id) => bot.sendGroupMsg(id, message.toString()))

    options.catch.forEach((c) => {
      process.on(c, (reason, origin) => {
        handler(`${reason.stack}`, sendPrivate)
        handler(`${reason.stack}`, sendGroup)
      })
    })
    installed = true
  }
}

module.exports.v3 = {
  name: 'blame-koishi-v3',
  apply(ctx, options) {
    if (installed) return
    const findSamePlatformBots = (platform) =>
      ctx.bots.filter((bot) => bot.platform === platform)

    // merge options with default options
    options = { ...defaultOptions, ...options }
    if (!options.send.private) options.send.private = []
    if (!options.send.group) options.send.group = []
    if (!options.send.channel) options.send.channel = []
    const concatGroupAndChannel = () => [
      ...options.send.group,
      ...options.send.channel
    ]

    // notify api change
    if (options.send.group.length) {
      console.log(
        'please use `options.send.channel` instead of `options.send.group`'
      )
    }

    const sendPrivate = (message) => {
      options.send.private.forEach((ptId) => {
        const [platform, id] = ptId.split(':')
        if (!id) throw new Error('v3 needs `platform:id` as a receiver id')
        const samePlatformBots = findSamePlatformBots(platform)

        const bot =
          options.sender.find((sender) =>
            samePlatformBots.find(
              (bot) => `${bot.platform}:${bot.id}` === sender
            )
          ) || ctx.bots.find((bot) => bot.platform === platform) // find specified sender bot or choose a bot on same platform

        bot.sendPrivateMessage(id.toString(), message.toString()).catch(err => ctx.logger('blame').error('error when sending blame:', err))
      })
    }

    const sendGroup = (message) => {
      concatGroupAndChannel().forEach((ptId) => {
        const [platform, id] = ptId.split(':')
        if (!id) throw new Error('v3 needs `platform:id` as a receiver id')
        const samePlatformBots = findSamePlatformBots(platform)

        const bot =
          options.sender.find((sender) =>
            samePlatformBots.find(
              (bot) => `${bot.platform}:${bot.id}` === sender
            )
          ) || ctx.bots.find((bot) => bot.platform === platform) // find specified sender bot or choose a bot on same platform

        bot.sendGroupMessage(id.toString(), message.toString()).catch(err => ctx.logger('blame').error('error when sending blame:', err))
      })
    }

    options.catch.forEach((c) => {
      process.on(c, (reason, origin) => {
        console.log('caught error', c, reason.stack)
        handler(`${reason.stack}`, sendPrivate)
        handler(`${reason.stack}`, sendGroup)
      })
    })
    installed = true
  }
}

try {
  const { Schema } = require('koishi')
  module.exports.v4 = {
    name: 'blame-koishi-v4',
    schema: Schema.object({
      catch: Schema.array(String).default(['unhandledRejection', 'uncaughtException']),
      send: Schema.object({
        private: Schema.array(String).default([]).description('send errors to private chat'),
        channel: Schema.array(String).default([]).description('send errors to channel chat'),
        group: Schema.array(String).default([]).description('send errors to channel chat (deprecated)')
      }),
      sender: Schema.array(String).description('send blames from these bots'),
      crash: Schema.boolean().default(false).description('crash app after sent message')
    }),
    apply(ctx, options) {
      const logger = ctx.logger('blame')
      if (installed) return
      const findSamePlatformBots = (platform) =>
        ctx.bots.filter((bot) => bot.platform === platform)

      if (!options.send.private) options.send.private = []
      if (!options.send.group) options.send.group = []
      if (!options.send.channel) options.send.channel = []

      const concatGroupAndChannel = () => [
        ...options.send.group,
        ...options.send.channel
      ]

      // notify api change
      if (options.send.group.length) {
        console.log(
          'please use `options.send.channel` instead of `options.send.group`'
        )
      }

      const sendPrivate = (message) => {
        options.send.private.forEach((ptId) => {
          const [platform, id] = ptId.split(':')
          if (!id) throw new Error('v3 needs `platform:id` as a receiver id')
          const samePlatformBots = findSamePlatformBots(platform)

          const bot =
            options.sender.find((sender) =>
              samePlatformBots.find(
                (bot) => `${bot.platform}:${bot.id}` === sender
              )
            ) || ctx.bots.find((bot) => bot.platform === platform) // find specified sender bot or choose a bot on same platform
          if (!bot) {
            logger.error('@sendPrivate: unable to find a bot')
            if (options.crash) crash()
            return
          }
          return bot.sendPrivateMessage(id.toString(), message.toString()).catch(err => ctx.logger('blame').error('error when sending blame:', err))
        })
      }

      const sendGroup = (message) => {
        concatGroupAndChannel().forEach((ptId) => {
          const [platform, id] = ptId.split(':')
          if (!id) throw new Error('v3 needs `platform:id` as a receiver id')
          const samePlatformBots = findSamePlatformBots(platform)

          const bot =
            options.sender.find((sender) =>
              samePlatformBots.find(
                (bot) => `${bot.platform}:${bot.id}` === sender
              )
            ) || ctx.bots.find((bot) => bot.platform === platform) // find specified sender bot or choose a bot on same platform
          if (!bot) {
            logger.error('@sendGroup/Channel: unable to find a bot')
            if (options.crash) crash()
            return
          }
          return bot.sendMessage(id.toString(), message.toString()).catch(err => ctx.logger('blame').error('error when sending blame:', err))
        })
      }

      options.catch.forEach((c) => {
        process.on(c, async (reason, origin) => {
          const p = loopProtector()
          logger.info('caught', c, reason.stack)
          if (p(reason)) {
            logger.info('detected loop, skip sending')
            if (options.crash) crash()
            return
          }
          await Promise.all([
            handler(`${reason.stack}`, sendPrivate),
            handler(`${reason.stack}`, sendGroup)
          ])
          if (options.crash) {
            crash(1)
          }
          // flush error
          p(undefined)
        })
      })
      installed = true
    }
  }

} catch (err) {
  // noop
}


// const { version } = require('koishi-core')
let version
try {
  // @ts-ignore
  const k = require('koishi')
  version = k.version
} catch (err) {
  // @ts-ignore
  const k = require('koishi-core')
  version = k.version
}
const [major] = version.split('.')

const availableVersions = Object.keys(module.exports).filter(k => k.startsWith('v'))
const suitableVersion = availableVersions.find(available => available === `v${major}`)
if (!suitableVersion) {
  module.exports.name = 'blame-yourself'
  module.exports.apply = (ctx) => {
    ctx.logger('blame').error('no suitable version found. You can forcefully pick a version (require(\'koishi-plugin-blame\').v2).')
    ctx.logger('blame').error('there might be an update for this plugin, try update this plugin.')
  }
}

module.exports = module.exports[`v${major}`]

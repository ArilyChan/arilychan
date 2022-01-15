const admins = require('../admins')
const path = require('path')
const appDir = path.dirname(require.main.filename)
const recipeFilter = require('../filters/group.blackFarts.recipe')

const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder((app) => app, 'any'),
    use: [
      {
        type: 'node_module',
        require: 'blackfarts',
        filter: [
          meta => recipeFilter(263668213)(meta).then(result => {
            if (!result) meta.send('去别的群试试吧.').catch(e => console.error.bind(console))
            return result
          }),
          require('../filters/group.blackFarts.recipe.restrictHours')([{ from: 9, to: 11 }, { from: 14, to: 17 }, { from: 20, to: 24 }], 738401694)
        ]
      }, {
        type: 'node_module',
        require: 'sb-plugin-osu-stat-screenshot',
        options: {
          base: 'http://info.osustuff.ri.mk/cn'
        }
      },
      {
        type: 'node_module',
        require: 'koishi-plugin-sillychooser',
        options: {
          prefixs: ['!', '！']
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-ppysb-query',
        options: {
          admin: admins, // 管理员自行添加
          database: path.join(appDir, 'Plugins/exsper/ppysbQuery/storage/database.db'),
          prefixs: ['*']
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-ppysh-query',
        options: {
          admin: admins, // 管理员自行添加
          apiKey: process.env.BANCHO_API_KEY || '123456788', // osu Api token，必要
          database: path.join(appDir, 'Plugins/exsper/ppyshQuery/storage/database.db'),
          prefixs: ['?', '？']
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-osuercalendar',
        options: {
          users: {
            admin: admins, // 管理员自行添加
            blackList: [],
            whiteList: []
          },
          eventFile: path.join(appDir, 'Plugins/exsper/osuerCalendar/osuercalendar-events.json') // __dirname为config文件夹
        }
      }, {
        type: 'node_module',
        require: 'arilychan-radio',
        options: {
          web: {
            host: 'https://bot.ri.mk',
            path: '/radio'
          },
          expire: 7,
          isAdmin (meta) {
            return admins.includes(meta.userId)
          }
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-blame',
        options: {
          send: {
            private: ['onebot:879724291']
          }
        }
      }, {
        type: 'node_module',
        require: 'sb-plugin-auth',
        options: {
          role: 'auth'
        }
      },
      {
        type: 'node_module',
        require: 'koishi-plugin-puppeteer-cluster'
      }
    ]
  }
  // {
  //   for: ContextBuilder((app) => app, 'any'),
  //   use: [
  //     // {
  //     //   type: 'node_module',
  //     //   require: 'koishi-plugin-mongo',
  //     //   options: {
  //     //     uri: process.env.DB_URI,
  //     //     name: 'ArilyChan'
  //     //   }
  //     // },
  //     {
  //       type: 'node_module',
  //       require: 'koishi-plugin-puppeteer-cluster'
  //     },
  //     // {
  //     //   type: 'node_module',
  //     //   require: 'koishi-plugin-eval',
  //     //   options: {
  //     //     userFields: ['foo', 'id', 'authority'],
  //     //     setupFiles: {
  //     //       'fetch.js': `${appDir}/config/eval/fetch.js`,
  //     //       'cqcode-builder': `${appDir}/config/eval/cqcode.js`
  //     //     }
  //     //   }
  //     // }
  //   ]
  // }
]

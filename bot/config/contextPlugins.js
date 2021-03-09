const admins = require('./admins')
const path = require('path')
const appDir = path.dirname(require.main.filename)
const recipeFilter = require('./filters/group.blackFarts.recipe')

const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder((app) => app, 'any'),
    use: [
      {
        type: 'node_module',
        require: 'sb-plugin-osu-stat-screenshot',
        priority: 8
      },
      {
        type: 'node_module',
        require: 'blackfarts',
        priority: 1,
        filter: [
          meta => recipeFilter(263668213)(meta).then(result => {
            if (!result) meta.$send('去别的群试试吧.').catch(e => console.error.bind(console))
            return result
          }),
          require('./filters/group.blackFarts.recipe.restrictHours')([{ from: 9, to: 11 }, { from: 14, to: 17 }, { from: 20, to: 24 }], 738401694)
        ]
      }, {
        type: 'node_modules',
        path: 'sb-plugin-message-recorder',
        subPlugin: 'recorder',
        options: {
          db: {
            uri: process.env.RECORDER_DB_URI
          }
        },
        priority: 9999
      }, {
        type: 'node_modules',
        path: 'sb-plugin-message-recorder',
        subPlugin: 'slipper',
        filter: [
          // meta => !meta.message.startsWith('*'),
          // meta => !meta.message.startsWith('今日运势')
        ],
        priority: -1
      }, {
        type: 'node_module',
        require: 'koishi-plugin-sillychooser',
        priority: 2,
        options: {
          prefixs: ['!', '！']
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-ppysb-query',
        priority: 4,
        options: {
          admin: admins, // 管理员自行添加
          database: path.join(appDir, 'Plugins/exsper/ppysbQuery/storage/database.db'),
          prefixs: ['*']
        }
      }, {
        type: 'node_module',
        require: 'koishi-plugin-ppysh-query',
        priority: 5,
        options: {
          admin: admins, // 管理员自行添加
          apiKey: process.env.BANCHO_API_KEY || '123456788', // osu Api token，必要
          database: path.join(appDir, 'Plugins/exsper/ppyshQuery/storage/database.db'),
          prefixs: ['?', '？']
        }
      // }, {
      //   type: 'node_module',
      //   require: 'koishi-plugin-osuercalendar',
      //   priority: 3,
      //   options: {
      //     users: {
      //       admin: admins, // 管理员自行添加
      //       blackList: [],
      //       whiteList: []
      //     },
      //     eventFile: path.join(appDir, 'Plugins/exsper/osuerCalendar/osuercalendar-events.json') // __dirname为config文件夹
      //   }
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
      // }, {
      //   type: 'node_module',
      //   require: 'koishi-plugin-blame',
      //   priority: -2,
      //   options: {
      //     send: {
      //       private: [879724291]
      //     }
      //   }
      }, {
        type: 'node_module',
        require: 'sb-plugin-auth',
        priority: -3,
        options: {
          role: 'auth'
        }
      }
    ]
  }
  // {
  //   for: ContextBuilder((app) => app.group(1097526643), 'test-groups'),
  //   use: [
  //     // {
  //     //   type: 'node_module',
  //     //   require: 'koishi-plugin-mongo',
  //     //   options: {
  //     //     uri: process.env.DB_URI,
  //     //     name: 'ArilyChan'
  //     //   }
  //     // },
  //     // {
  //     //   type: 'node_module',
  //     //   require: 'koishi-plugin-eval-addons'
  //     // },
  //     {
  //       type: 'node_module',
  //       require: 'koishi-plugin-eval',
  //       options: {
  //         userFields: ['foo', 'id', 'authority'],
  //         setupFiles: {
  //           'fetch.js': `${appDir}/config/eval/fetch.js`,
  //           'cqcode-builder': `${appDir}/config/eval/cqcode.js`
  //         }
  //       }
  //     }
  //   ]
  // }
]

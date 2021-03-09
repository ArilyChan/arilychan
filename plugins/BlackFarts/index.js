const CabbageReaction = require('./Reaction')
const Command = require('./Command')

const cabbageReaction = require('./Cabbage/CabbageReactionConfig')
const explosiveReaction = require('./Explosive/ExpolosiveReactionConfig')
const gambleReaction = require('./EWC-Gamble/GambleReactionConfig')
const recipeReaction = require('./Recipe/RecipeReactionConfig')
const { menu, models: menuModels } = require('./Recipe/menu')
// const RollReaction = require('./Roll/RollReaction')
// const ExsperReaction = require('./Exsper/ExsperReaction');
module.exports.name = 'BlackFarts'
module.exports.init = (options) => ({
  originalMenu: menu,
  menu: {},
  menuModels
})

const web = require('./server')
let webInited = false
module.exports.webView = (options, storage, http) => {
  if (webInited) return undefined
  webInited = true
  return web(storage, http)
}

module.exports.apply = function (app, options, storage) {
  const cabbage = new CabbageReaction(cabbageReaction)
  const explosive = new CabbageReaction(explosiveReaction)
  const gamble = new CabbageReaction(gambleReaction)
  const recipe = new CabbageReaction(recipeReaction)

  app.middleware(async (meta, next) => {
    let reacted = false
    if (meta.message[0] === '!' || meta.message[0] === '！') {
      reacted = Object.entries({ cabbage, explosive, gamble, recipe }).some(([name, reaction]) => {
        if (reaction.reactTo(new Command({ meta, app, storage }))) {
          // console.log(`${meta.message} Catched by subplugin: ${name}`);
          return true
        }
        return false
      })
    }
    if (!reacted) return next()
  })
}

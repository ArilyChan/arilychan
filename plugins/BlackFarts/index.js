const CabbageReaction = require('./Reaction')
const Command = require('./Command')

const Help = require('./Help')
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
  const help = new CabbageReaction(Help)

  app.middleware((meta, next) => {
    let reacted = false
    if (meta.content[0] === '!' || meta.content[0] === '！') {
      reacted = Object.entries({ help, cabbage, explosive, gamble, recipe }).some(([name, reaction]) => {
        if (reaction.reactTo(new Command({ meta, app, storage }))) {
          // console.log(`${meta.content} Catched by subplugin: ${name}`);
          return true
        }
        return false
      })
    }
    if (!reacted) return next()
  })
}

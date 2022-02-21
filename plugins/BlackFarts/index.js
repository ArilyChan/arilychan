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
module.exports.name = 'blackfarts'
// module.exports.init = (options) => ({
//   originalMenu: menu,
//   menu: {},
//   menuModels
// })

const web = require('./server')
// const webInited = false
// module.exports.webApp = (options, storage, http) => {
//   if (webInited) return undefined
//   webInited = true
//   return web(storage, http)
// }

module.exports.apply = function (app, options) {
  const cabbage = new CabbageReaction(cabbageReaction)
  const explosive = new CabbageReaction(explosiveReaction)
  const gamble = new CabbageReaction(gambleReaction)
  const recipe = new CabbageReaction(recipeReaction)
  const help = new CabbageReaction(Help)

  const storage = {
    originalMenu: menu,
    menu: {},
    menuModels
  }

  recipeReaction?.['recipe.init']?.({ storage })

  app.using(['express'], ({ express, _expressHttpServer }) => {
    express.use(options?.web?.prefix || '/blackfarts', web(storage, _expressHttpServer))
  })

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

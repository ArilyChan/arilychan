const { Schema } = require('koishi')
const CabbageReaction = require('./Reaction')
const Command = require('./Command')

const cabbageReaction = require('./Cabbage/CabbageReactionConfig')
const gambleReaction = require('./EWC-Gamble/GambleReactionConfig')
const recipeReaction = require('./Recipe/RecipeReactionConfig')
const { menu, models: menuModels } = require('./Recipe/menu')
// const explosiveReaction = require('./Explosive/ExplosiveReactionConfig')
// const RollReaction = require('./Roll/RollReaction')
module.exports.name = 'blackfarts'

const web = require('./server')
module.exports.schema = Schema.object({
  web: Schema.object({
    prefix: Schema.string().default('/blackfarts').description('web server prefix')
  })
})
module.exports.apply = function (app, options) {
  const cabbage = new CabbageReaction(cabbageReaction)
  // const explosive = new CabbageReaction(explosiveReaction)
  const gamble = new CabbageReaction(gambleReaction)
  const recipe = new CabbageReaction(recipeReaction)

  const storage = {
    originalMenu: menu,
    menu: {},
    menuModels
  }

  recipeReaction?.['recipe.init']?.({ storage })

  app.using(['express'], function blackFartWebService ({ express, _expressHttpServer }) {
    express.use(options?.web?.prefix || '/blackfarts', web(storage, _expressHttpServer))
  })

  app.middleware((meta, next) => {
    let reacted = false
    if (meta.content[0] === '!' || meta.content[0] === '！') {
      reacted = Object.entries({
        cabbage,
        // explosive,
        gamble,
        recipe
      }).some(([name, reaction]) => {
        if (reaction.reactTo(new Command({ meta, app, storage }))) {
          return true
        }
        return false
      })
    }
    if (!reacted) return next()
  })
}

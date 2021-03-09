const CQ = require('cqcode-builder')
const compiledMenu = []
let menuCompiled = false

function random (items) {
  return items[Math.floor(Math.random() * items.length)]
}

function split (str, separator, limit) {
  str = str.split(separator)

  if (str.length > limit) {
    var ret = str.splice(0, limit)
    ret.push(str.join(separator))

    return ret
  }

  return str
}

const compileMenu = async ({ storage }) => {
  Object.entries(storage.originalMenu).map(([menu, recipes]) => {
    compiledMenu.push(...recipes.map(recipe => ({
      name: recipe,
      nsfw: false,
      uploader: {
        name: 'arily',
        qq: '879724291'
      },
      menu: {
        _id: -1,
        name: menu,
        nsfw: false
      }
    })))
  })
  const RecipeModel = storage.menuModels.Recipe
  const all = await RecipeModel.find({}).populate('menu').exec().then(results => results.map(result => result.toObject()))
  const mixin = all.reduce((acc, recipe) => {
    if (!recipe || !recipe.menu) {
      console.log(recipe)
      return acc
    }
    if (!acc[recipe.menu.name]) acc[recipe.menu.name] = []
    console.log('add', recipe.name, 'to', recipe.menu.name)
    acc[recipe.menu.name].push(recipe.name)
    return acc
  }, {})
  storage.menu = {
    ...storage.originalMenu,
    ...mixin
  }
  compiledMenu.push(...all)
  menuCompiled = true
}

const recipeToString = function (order) {
  const message = []
  message.push(`${order.methodOfConsumption || '吃'}${order.name}\n`)
  if (order.description) message.push(order.description, '\n')
  if (order.uploader.name) message.push('推荐人: ', order.uploader.name, '\n')
  // if (order.uploader.qq) message.push('qq: ', order.uploader.qq, '\n')
  if (order.cqImage) message.push(order.cqImage, '\n')
  return message.join('').trim()
}

const echoRecipe = function (meta, req, menu = compiledMenu) {
  const message = []
  if (meta.messageType !== 'private') message.push(new CQ.Reply().id(meta.messageId))
  if (!req) {
    // const order = random(compiledMenu)
    // message.push(recipeToString(order))
    message.push(randomRecipe(menu).toString())
    return meta.$send(message.join('').trim()).catch(e => console.error.bind(console))
  } else {
    // const filtered = compiledMenu.filter(recipe => recipe.menu.name === req)
    // // console.log(filtered)
    // if (filtered.length <= 0) return meta.$send('没东西')
    // const order = random(filtered)
    // message.push(recipeToString(order))
    message.push(randomRecipe(menu, recipe => recipe.menu.name === req))
    return meta.$send(message.join('').trim()).catch(e => console.error.bind(console))
  }
}

const recipe = async ({ command, meta, storage }) => {
  const [, req] = command
  if (!menuCompiled) await compileMenu({ storage })
  echoRecipe(meta, req, compiledMenu.filter(item => !item.nsfw && !item.menu.nsfw))
}

const nsfwRecipe = async ({ command, meta, storage }) => {
  const [, req] = command
  if (!menuCompiled) await compileMenu({ storage })
  echoRecipe(meta, req, compiledMenu)
}
const randomRecipe = function (menu = compiledMenu, filter = () => true) {
  const filteredRecipes = menu.filter(filter)
  if (filteredRecipes.length <= 0) {
    return {
      toString: () => '没东西'
    }
  }
  const order = random(filteredRecipes)
  return {
    toString: () => recipeToString(order)
  }
}

const refreshMenu = async ({ command, meta, storage }) => {
  compiledMenu.length = 0
  return compileMenu({ storage }).then(() => meta.$send('ok')).catch(e => console.error.bind(console))
}

const addRecipe = async ({ command, meta, storage }, consumptionMethod = '吃') => {
  try {
    const [, name, ...others] = command
    const originalMenuNames = Object.keys(storage.originalMenu)
    if (originalMenuNames.some(original => original === name)) return meta.$send('不能动这个!!').catch(e => console.error.bind(console))
    let { recipeSection, cqImage } = others.join(' ').split('[CQ:image,').reduce((acc, startsWithCQImage, index) => {
      if (index === 0 && !startsWithCQImage.startsWith('file=')) {
        acc.recipeSection.push(startsWithCQImage.replace('\r', '\n'))
        return acc
      }
      const [cqCode, rest] = split(startsWithCQImage, ']', 1)
      acc.cqImage.push(`[CQ:image,${cqCode}]`)
      if (rest) acc.recipeSection.push(rest.replace('\r', '\n'))
      return acc
    }, { recipeSection: [], cqImage: [] })
    recipeSection = recipeSection.join('\n').trim()
    const [recipe, ...descriptions] = recipeSection.split('\n')
    const description = descriptions.join('\n').trim()
    cqImage = cqImage.join('\n').trim()
    if (!recipe) return meta.$send('<menu> <recipe> [图片]').catch(e => console.error.bind(console))
    const { Recipe: RecipeModel, Menu: MenuModel } = storage.menuModels
    let menu = await MenuModel.findOne({ name }).exec()
    if (!menu) {
      menu = new MenuModel({ name })
      menu = await menu.save()
    }
    let newrecipe = await RecipeModel.findOne({ name: recipe, menu: menu._id }).exec()
    if (newrecipe) return meta.$send('menu exists!').catch(e => console.error.bind(console))
    const recipeContent = {
      name: recipe,
      description,
      methodOfConsumption: consumptionMethod,
      cqImage,
      uploader: {
        name: meta.sender.nickname,
        qq: meta.sender.userId.toString()
      },
      menu: menu._id
    }
    newrecipe = new RecipeModel(recipeContent)
    newrecipe.save((err, saved) => {
      if (err) meta.$send(err).catch(e => console.error.bind(console))
      else meta.$send('ok').catch(e => console.error.bind(console))
      if (!storage.menu[name]) storage.menu[name] = []
      storage.menu[name].push(newrecipe.name)
      compiledMenu.push({
        ...recipeContent,
        menu
      })
    })
  } catch (error) {
    meta.$send('出了点问题。。。希望你能帮我把这份报错发给阿日').catch(e => console.error.bind(console))
    meta.$send(error.stack).catch(e => console.error.bind(console))
  }
}

const addMeal = (hi) => addRecipe(hi, '吃')
const addDrink = (hi) => addRecipe(hi, '喝')

const definedMethodOfConsumption = {
  吃的: '吃',
  食物: '吃',
  喝的: '喝',
  饮品: '喝'
}
const editRecipe = async ({ command, meta, storage }) => {
  let [, menu, recipe, action] = command

  if (!action) return
  if (!action.startsWith('是')) return
  const [, methodOfConsumption] = Object.entries(definedMethodOfConsumption).find(([actionOfConsumption, methodOfConsumption]) => action.includes(actionOfConsumption))
  if (!methodOfConsumption) return meta.$send('?').catch(e => console.error.bind(console))

  const { Recipe, Menu } = storage.menuModels

  menu = await Menu.findOne({ name: menu }).exec()
  if (!menu) return meta.$send('there\'s no such menu').catch(e => console.error.bind(console))

  recipe = await Recipe.findOne({ name: recipe, menu: menu._id }).exec()
  if (!recipe) return meta.$send('there\'s no such recipe in the menu').catch(e => console.error.bind(console))

  recipe.methodOfConsumption = methodOfConsumption
  await recipe.save()

  const inCompiledMenu = compiledMenu.find(r => r.name === recipe.name && r.menu.name === menu.name)
  if (inCompiledMenu) inCompiledMenu.methodOfConsumption = methodOfConsumption
  meta.$send('好了好了我知道了')
}

const removeRecipe = async ({ command, meta, storage }) => {
  let [, name, ...recipe] = command
  recipe = recipe.join(' ')
  if (!recipe) return meta.$send('<menu> <recipe>').catch(e => console.error.bind(console))
  const { Recipe: RecipeModel, Menu: MenuModel } = storage.menuModels
  let menu = await MenuModel.findOne({ name }).exec()
  if (!menu) {
    menu = new MenuModel({ name })
    await menu.save((err) => { if (err) console.log('menu error', err) })
  }
  const newrecipe = await RecipeModel.findOneAndRemove({ name: recipe }).exec()
  if (!newrecipe) return meta.$send('menu non-exists!').catch(e => console.error.bind(console))
  meta.$send('getting rid da 💩').catch(e => console.error.bind(console))
  if (!storage.menu[name]) return
  storage.menu[name] = storage.menu[name].filter(r => r !== recipe)
  const ptrRecipe = compiledMenu.findIndex(r => r.name === recipe)
  if (ptrRecipe) compiledMenu.splice(ptrRecipe, 1)
}

const markNSFWMenu = async function (storage, name, isNSFW) {
  const { Menu: MenuModel } = storage.menuModels
  const menu = await MenuModel.findOne({ name }).exec()
  if (!menu) return false
  menu.nsfw = isNSFW
  await menu.save()
  compiledMenu
    .filter(recipe => recipe.menu._id === menu._id)
    .map(recipe => { recipe.menu.nsfw = isNSFW })
  return true
}

const markNSFWRecipe = async function (storage, menu, recipe, meta, isNSFW) {
  const { Recipe, Menu } = storage.menuModels
  menu = await Menu.findOne({ name: menu }).exec()
  if (!menu) return meta.$send('there\'s no such menu').catch(e => console.error.bind(console))

  recipe = await Recipe.findOne({ name: recipe, menu: menu._id }).exec()
  if (!recipe) return meta.$send('there\'s no such recipe in the menu').catch(e => console.error.bind(console))

  recipe.nsfw = isNSFW
  await recipe.save()

  const inCompiledMenu = compiledMenu.find(r => r.name === recipe.name && r.menu.name === menu.name)
  if (inCompiledMenu) inCompiledMenu.nsfw = isNSFW
  meta.$send('好了好了我知道了').catch(e => console.error.bind(console))
}

const markNSFWMenuBot = async function ({ command, meta, storage }, isNSFW) {
  const [, name] = command
  if (!name) return meta.$send('<menu>').catch(e => console.error.bind(console))
  const result = await markNSFWMenu(storage, name, isNSFW)
  if (!result) meta.$send('menu non-exists').catch(e => console.error.bind(console))
  meta.$send('should work').catch(e => console.error.bind(console))
}

const markNSFWRecipeBot = async function ({ command, meta, storage }, isNSFW) {
  let [, menu, ...recipe] = command
  recipe = recipe.join(' ')
  if (!recipe) return meta.$send('<menu> <recipe>').catch(e => console.error.bind(console))
  markNSFWRecipe(storage, menu, recipe, meta, isNSFW)
}

module.exports = {
  吃什麼: recipe,
  吃什么: recipe,
  吃啥: recipe,
  吃点刺激的: nsfwRecipe,
  吃點刺激的: nsfwRecipe,
  'menu.marknsfw': (input) => markNSFWMenuBot(input, true),
  'recipe.marknsfw': (input) => markNSFWRecipeBot(input, true),
  'menu.marksfw': (input) => markNSFWMenuBot(input, false),
  'recipe.marksfw': (input) => markNSFWRecipeBot(input, false),
  加个菜: addRecipe,
  加個菜: addRecipe,
  加个吃的: addMeal,
  加個吃的: addMeal,
  加个饮品: addDrink,
  加個飲品: addDrink,
  那啥: editRecipe,
  倒: removeRecipe,
  同步菜谱: refreshMenu
}

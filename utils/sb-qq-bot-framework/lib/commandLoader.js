const glob = require('glob')
const path = require('path')

function Fakeapp (app) {
  this.app = app
  this.registeredCommands = []
};
Fakeapp.prototype.command = function (...args) {
  if (this.registeredCommands.includes(args[0])) {
    console.log('command conflict')
  }
  console.log(`Load Command: ${args[0]}: ${args[1] === undefined ? 'no doc' : args[1]}`)
  return this.app.command(...args)
}

module.exports = (app) => {
  const commands = glob.sync('./lib/commands/*.js').map((file) => {
    return {
      file: path.resolve(file),
      module: require(path.resolve(file))
    }
  })
  app = new Fakeapp(app)
  commands.forEach(({ module, file }) => {
    try {
      module(app, module.name)
    } catch (Error) {
      if (Error.name === 'TypeError') {
        try {
          module.default(app, module.name)
        } catch (Error) {
          console.log(`Load Command Failed: ${file}`, Error)
        }
      } else {
        throw Error
      }
    }
  })
}

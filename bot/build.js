const app = require('./init')
app.then(app =>
  app.ci.build()
)
  .then(() => process.exit(0))

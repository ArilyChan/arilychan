const { Deranker, calcUser } = require('./common.js')
async function addUser (user, force = false) {
  return await calcUser(user, force)
}

module.exports = addUser
// addUser(process.argv.slice(2).join(' ')).then(result => console.log(result));

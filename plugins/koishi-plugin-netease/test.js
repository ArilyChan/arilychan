const api = require('./api')

async function test () {
  try {
    const str = 'room 1611'
    const reply = await api.search(str)
    console.log(reply)
  } catch (ex) {
    console.log(ex)
  }
}

test()

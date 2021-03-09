const util = require('util')
const exec = util.promisify(require('child_process').exec)
async function main () {
  const stamp = new Date().getTime()
  const { stdout, stderr } = await exec(`node ${__dirname}/ResultTableString.js | convert -font "/Library/Fonts/Andale\ Mono.ttf" -pointsize 30 label:@- jpg:- | base64 `, { maxBuffer: 10000 * 1024 })

  if (stderr) {
    console.error(`error: ${stderr}`)
  }
  return stdout
}
module.exports = main

const os = require('os')
// const ip = require('ip')
// const cTable = require('console.table')
const config = require('./cabbageReactionUser')

// function tableToString (results) {
//   return cTable.getTable(results).trim()
// }
module.exports = ({ command, meta }) => {
  if (command[1] === '小阿日') {
    if (config.isManager(meta.userId)) {
      if (command[2] === 'host') meta.$send(`Running on ${os.hostname()}`).catch(e => console.error.bind(console))
      else if (command[2] === 'ip') {
        let family = command.slice(3).join(' ').trim()
        family = family === '' ? 'ipv4 ipv6' : family
        meta.$send(Object.entries(os.networkInterfaces()).map(([iface, ips]) => ips.filter(ip => family.includes(ip.family.toLowerCase())).map(ip => `${iface}: ${ip.address}`).join('\n')).join('\n').trim()).catch(e => console.error.bind(console))
      } else if (command[2] === 'iface') meta.$send(JSON.stringify(os.networkInterfaces(), null, '\t')).catch(e => console.error.bind(console))
      else if (command[2] === 'cpu') {
        const message = []
        const cpus = os.cpus()
        for (let i = 0, len = cpus.length; i < len; i++) {
          message.push()
          const cpu = cpus[i]
          let total = 0

          for (const type in cpu.times) {
            total += cpu.times[type]
          }

          // for (type in cpu.times) {
          //     col.push(type, Math.round(100 * cpu.times[type] / total));
          // }
          // cpu.times.idle
          message.push(`${cpu.model} ${100 - Math.round(100 * cpu.times.idle / total)}%`)
        }
        meta.$send(message.join('\n')).catch(e => console.error.bind(console))
      } else meta.$send('I\'m here.').catch(e => console.error.bind(console))
    } else {
      meta.$send('I\'m here.').catch(e => console.error.bind(console))
    }
    return true
  }
}

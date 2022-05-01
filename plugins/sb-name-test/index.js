const { Schema } = require('koishi')
module.exports.schema = Schema.object({
  endpoint: Schema.string()
    .description('endpoint to usbc checker. see https://github.com/ppy-sb/sb-username-checker')
    .default('http://localhost:4532/test')
})
module.exports.apply = function sbNameTestPlugin (ctx, options) {
  options = new Schema(options)
  if (options.endpoint.endsWith('/')) {
    options.endpoint = options.endpoint.slice(0, options.endpoint.length - 1)
  }
  ctx.command('checkname <name:text>')
    .action(async (_, name) => {
      if (!name) return
      const res = await ctx.http.get(encodeURI(options.endpoint, {
        params: {
          name
        }
      }))
      if (!res) return
      if (!res.rejected) return `${name}: ok!`
      // name rejected by server
      const reply = [
        `${name}: rejected.`
      ]
      reply.push(...res.checkResult.map(({ field, index, length, message }) => {
        if (field === 'safeName') return null
        const before = name.slice(0, index)
        const positivePart = name.slice(index, index + length)
        const after = name.slice(index + length)
        return before + '<' + positivePart + '>' + after + ': ' + message
      }).filter(a => a))
      return reply.join('\n')
    })
}

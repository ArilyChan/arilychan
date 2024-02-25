const manual = require('sb-bot-manual')
const cabbage = manual.section('black-farts')
cabbage.entriesTitle = undefined

const recent = {}
async function helps ({ command, meta, app }) {
  // meta.send(helpcontents.join('\n')).catch(e => console.error.bind(console))
  const kw = command.slice(1).join(' ').trim()
  if (kw) {
    const result = manual.filter(kw)
    if (!result) return meta.send('没有找到相关词条')
    return meta.send(result.renderAsString())
  }
  if (new Date() - recent[meta?.groupId || meta?.userId]?.timestamp < 1000 * 60) return meta.send(`[CQ:reply,id=${recent[meta?.groupId || meta?.userId].messageId}] 刚刚发过，很长，往上面翻一翻`)
  await meta.send(manual.renderAsString())
  recent[meta?.groupId || meta?.userId] = {
    messageId: meta.messageId,
    timestamp: new Date()
  }
  await meta.send('说明很长。建议使用关键字查询: !help <关键字>')
}
module.exports = {
  help: helps
}

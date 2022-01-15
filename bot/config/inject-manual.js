const manual = require('sb-bot-manual')
manual.description('小阿日使用说明')
manual.detail('<>中的参数必须提供，[]中的参数为可选。\n"> "后面的是命令')
const help = manual
  .section('internal')
  .description('已有内建帮助的功能')

help
  .entry('!help')

  .usage('!help [查询关键字]')

help
  .entry('ppy.sh查询')

  .usage('?help')

help
  .entry('ppy.sb查询')

  .usage('*help')

help
  .entry('随机')
  .description('帮你决定一些事情。你有很多种问法。')
  .detail('！今天吃饭吗？ ！今天出不出门 ！打不打fortnite ！刷dt还是hr还是hd还是hddthr <都可以问')

const fortune = manual.section('fortune')
  .name('运势')
  .tag('算命').tag('抽奖').tag('宜').tag('忌')

fortune
  .entry('今日运势')
  .tag('今日mod').tag('mod')
  .usage('今日运势')

fortune
  .entry('添加活动')
  .usage('！添加活动 <宜详情> <忌详情>')

import { Bridge } from '../bridge-between-mail-and-message'
import { App, Adapter, Bot, Logger } from 'koishi'

class MyBot extends Bot {
  logger: Logger
  constructor (a, b) {
    super(a, b)
    this.logger = new Logger('adapter-mail')
  }

  async sendMessage (channelId: string, content: string) {
    // 这里应该执行发送操作
    this.logger.debug('send:', content)
    // Bridge.send(, content)
    return []
  }
}

export default class MailAdapter extends Adapter {
  app: App
  constructor (app: App) {
    // 请注意这里的第二个参数是应该是一个构造函数而非实例
    super()
  }

  async start (bot) {

    // 收到 http post 请求时，生成会话对象并触发事件
    // this.app.router.post('/', (ctx) => {
    // const session = new Session(this.app, ctx.request.body) we will look into this later
    // this.dispatch(session)
    // })
  }

  async stop (bot) {}
}

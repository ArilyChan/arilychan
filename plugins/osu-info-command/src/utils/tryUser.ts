import { Session } from 'koishi'
import { Options } from '../'
import { unescapeOnebotSpecialChars } from './unescape'
export default function tryUser (options: Options) {
  const defaultServer = Object.entries(options.server).find(([server, conf]) => conf.default)?.[0]
  return {
    tryUser (user: string | undefined, session: Session & {user: {osu: Record<string, any>}}, server = defaultServer): string | undefined {
      return (user && unescapeOnebotSpecialChars(user)) || session.user?.osu?.[server]?.user
    }
  }
}

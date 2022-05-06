import { Options } from '../index'
export default function tryUser (options: Options) {
  const defaultServer = Object.entries(options.server).find(([server, conf]) => conf.default)?.[0]
  return {
    tryUser (user, session, server = defaultServer) {
      return session.user?.osu?.[server]?.user || user
    }
  }
}

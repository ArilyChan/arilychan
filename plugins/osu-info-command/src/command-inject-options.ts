import { Command } from 'koishi'
export default function injectOsuOptions<T extends Command> (command: T, options: Array<string | Array<string | Record<any, any>>>): T {
  options.forEach(option => {
    let _option: string, _optionConfig: Record<any, any>
    if (typeof option === 'string') {
      _option = option
    } else if (Array.isArray(_option)) {
      _option = option[0] as string
    } else throw new Error(`Invalid option type: ${typeof _option}`)
    switch (_option) {
      case 'mode':
        command.option('mode', '-m <mode>', _optionConfig)
        break
      case 'server':
        command.option('server', '-s <server>', _optionConfig)
        break
      case 'from':
        command.option('from', '<time>', _optionConfig)
    }
  })
  return command
}

import { MailContactInterface, LocalMailContactInterface } from '../../types'
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
export class MailContact implements MailContactInterface {
  name?: string
  address: string
  static _printName = 'Mail'
  constructor ({ name, address }: MailContactInterface) {
    this.name = name
    this.address = address
  }

  [customInspectSymbol] (depth, inspectOptions, inspect) {
    const { stylize } = inspectOptions
    const formattedAddress = stylize(`${`${stylize(this.name ?? '', 'null')}`}${stylize(`<${this.address}>`, 'string')}`, 'module')
    // @ts-expect-error not so sure about this.
    return `${stylize(this.constructor._printName, 'special')}\`${formattedAddress}\``
  }
}

export class LocalMailContact extends MailContact implements LocalMailContactInterface {
  folders
  local: true = true
  static _printName = 'Mail<Local>'
  constructor ({ name, address, folders }: MailContactInterface & Partial<LocalMailContactInterface>) {
    super({ name, address })
    this.folders = folders
  }

  [customInspectSymbol] (depth, inspectOptions, inspect) {
    const rtn = super[customInspectSymbol](depth, inspectOptions, inspect)
    return `${rtn}${inspect({
      folders: this.folders
    }, inspectOptions)}`
  }
}

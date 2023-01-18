import { MailAddressInterface, LocalMailAddressInterface } from '../../types'
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
export class MailAddress<Local extends boolean> implements MailAddressInterface<Local> {
  name: string = 'unknown'
  address: string
  local?: Local
  static _printName = 'Mail'
  constructor ({ name, address, local }: MailAddressInterface<Local>) {
    this.name = name
    this.address = address
    this.local = local
  }

  [customInspectSymbol] (depth, inspectOptions, inspect) {
    const { stylize } = inspectOptions
    const formattedAddress = stylize(`${`${stylize(this.name ?? '', 'null')}`}${stylize(`<${this.address}>`, 'string')}`, 'module')
    // @ts-expect-error not so sure about this.
    return `${stylize(this.constructor._printName, 'special')}\`${formattedAddress}\``
  }

  toString () {
    return `${this.name} <${this.address}>`
  }
}

export class LocalMailAddress extends MailAddress<true> implements LocalMailAddressInterface {
  folders
  local: true = true
  static _printName = 'Mail<Local>'
  constructor ({ name, address, folders }: MailAddressInterface & Partial<LocalMailAddressInterface>) {
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

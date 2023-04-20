import { MailAddressInterface, LocalMailAddressInterface } from '../../types'
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
export class MailAddress implements MailAddressInterface<boolean> {
  name: string = 'unknown'
  address: string
  local?: boolean
  static _printName = 'Mail'
  constructor ({ name, address, local }: MailAddressInterface<boolean>) {
    this.name = name || this.name
    this.address = address
    this.local = local
  }

  [customInspectSymbol] (_, inspectOptions, __) {
    const { stylize } = inspectOptions
    const formattedAddress = stylize(`<${`${stylize(this.name ?? '', 'null')}`}${stylize(`<${this.address}>`, 'string')}>`, 'module')
    // @ts-expect-error not so sure about this.
    return `${stylize(this.constructor._printName, 'special')}${formattedAddress}`
  }

  toString () {
    return `${this.name} <${this.address}>`
  }

  extend (e: MailAddressInterface) {
    return new MailAddress({
      name: this.name,
      // @ts-expect-error intended
      address: this.address,
      local: this.local,
      ...e
    })
  }
}

export class LocalMailAddress extends MailAddress implements LocalMailAddressInterface {
  folders
  local: true = true
  static _printName = 'LocalMail'
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

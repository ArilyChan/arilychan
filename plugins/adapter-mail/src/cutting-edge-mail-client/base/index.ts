import { LocalMailAddressInterface } from '../../types'
export abstract class BaseIO {
  abstract address: LocalMailAddressInterface
  readyState: Boolean = false
}

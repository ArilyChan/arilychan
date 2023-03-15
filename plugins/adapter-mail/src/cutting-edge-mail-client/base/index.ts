import { LocalMailAddressInterface } from '../../types'
export abstract class BaseIO {
  abstract mail: LocalMailAddressInterface
  readyState: boolean = false
}

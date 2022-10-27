import { LocalMailAddressInterface } from '../../types'
export abstract class BaseIO {
  abstract contact: Map<string, LocalMailAddressInterface>
  readyState: Boolean = false
}

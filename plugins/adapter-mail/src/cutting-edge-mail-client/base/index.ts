import { LocalMailContactInterface } from '../../types'
export abstract class BaseIO {
  abstract contact: Map<string, LocalMailContactInterface>
  readyState: Boolean = false
}

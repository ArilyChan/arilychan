import { LocalMailContactInterface } from '../../types'
export abstract class BaseIO {
  abstract contact: LocalMailContactInterface | LocalMailContactInterface[]
  readyState: Boolean = false
}

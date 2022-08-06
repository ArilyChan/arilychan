import { OutgoingMail } from '../../types'
import { BaseIO } from '../base'
export abstract class BaseSender<T = any> extends BaseIO {
  readyState: boolean = false
  abstract send (mail: OutgoingMail): Promise<any>
  abstract prepare (withConnection?: T): Promise<void>
}

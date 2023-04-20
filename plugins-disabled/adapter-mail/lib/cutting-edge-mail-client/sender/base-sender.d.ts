import { OutgoingMail } from '../../types';
import { BaseIO } from '../base';
export declare abstract class BaseSender<T = any> extends BaseIO {
    readyState: boolean;
    abstract send(mail: OutgoingMail): Promise<any>;
    abstract prepare(withConnection?: T): Promise<void>;
}

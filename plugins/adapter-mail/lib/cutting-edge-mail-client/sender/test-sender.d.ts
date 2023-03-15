import { Logger } from 'koishi';
import { OutgoingMail } from '../../types';
import { LocalMailAddress } from '../address';
import { BaseSender } from './base-sender';
export type Options = ConstructorParameters<typeof LocalMailAddress>;
export declare class TestSender<T extends never> extends BaseSender<T> {
    logger: Logger;
    mail: LocalMailAddress;
    constructor(...opt: Options);
    send(mail: OutgoingMail): Promise<void>;
    prepare(): Promise<void>;
}

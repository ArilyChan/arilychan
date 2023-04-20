import { Logger } from 'koishi';
import { BaseReceiver } from './base-receiver';
import { IncomingMail } from '../../types';
import { LocalMailAddress } from '../address';
export type Options = ConstructorParameters<typeof LocalMailAddress>;
export declare class TestReceiver<T extends never> extends BaseReceiver<T> {
    logger: Logger;
    mail: LocalMailAddress;
    constructor(...opt: Options);
    fetch(): Promise<IncomingMail[]>;
    prepare(): Promise<void>;
    _fakeMail(context: Partial<IncomingMail>): Promise<void>;
    createFakeMail(context: Partial<IncomingMail>): IncomingMail;
}

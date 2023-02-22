import { LocalMailAddress } from '../address';
import { IncomingMail } from '../../types';
import { Logger } from 'koishi';
import { BaseReceiver } from './base-receiver';
import IMAP from 'node-imap';
export declare class IMAPReceiver<T extends never> extends BaseReceiver<T> {
    logger: Logger;
    imap: IMAP;
    mail: LocalMailAddress;
    interval: ReturnType<typeof setInterval>;
    constructor(option: ConstructorParameters<typeof IMAP>[0], address: LocalMailAddress);
    process(): Promise<void>;
    listen(): Promise<void>;
    fetch(opt?: IMAP.FetchOptions, search?: any[]): Promise<IncomingMail[]>;
    openBox(mailboxName: string): Promise<{
        box: IMAP.Box;
        close: () => PromiseLike<void>;
    }>;
    stop(): Promise<void>;
    prepare(): Promise<void>;
}

import { Logger } from 'koishi';
import { IncomingMail, MailSubscriber } from '../../types';
import { LocalMailAddress } from '../address';
import { BaseIO } from '../base';
type GetElementType<T extends any[]> = T extends Array<infer U> ? U : never;
export declare abstract class BaseReceiver<T = any> extends BaseIO {
    abstract logger: Logger;
    subscribers: Set<MailSubscriber>;
    abstract fetch(inbox?: LocalMailAddress['folders'] | GetElementType<LocalMailAddress['folders']>): Promise<IncomingMail[]>;
    abstract prepare(withConnection?: T): Promise<void>;
    subscribe(subscriber: MailSubscriber): void;
    unsubscribe(subscriber: MailSubscriber): void;
    incomingChain(mail: IncomingMail): Promise<void>;
}
export {};

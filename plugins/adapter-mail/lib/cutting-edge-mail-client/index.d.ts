import type { MailSubscriber, OutgoingMail, LocalMailAddressInterface } from '../types';
import type { BaseSender } from './sender/base-sender';
import type { BaseReceiver } from './receiver/base-receiver';
import { Logger } from 'koishi';
export default class MailClient {
    senders: Map<LocalMailAddressInterface, BaseSender<any>>;
    receivers: Map<LocalMailAddressInterface, BaseReceiver<any>>;
    logger: Logger;
    options: {
        receiver: {
            fetchOnUse: boolean;
        };
    };
    useSender<T extends BaseSender>(sender: T): Promise<any>;
    useReceiver<T extends BaseReceiver>(receiver: T): Promise<any>;
    subscribe(subscriber: MailSubscriber): void;
    unsubscribe(subscriber: MailSubscriber): void;
    send(mail: Partial<OutgoingMail> & Pick<OutgoingMail, 'to'>, sender?: BaseSender): Promise<any>;
    findSender(IAddress: LocalMailAddressInterface): BaseSender | undefined;
}

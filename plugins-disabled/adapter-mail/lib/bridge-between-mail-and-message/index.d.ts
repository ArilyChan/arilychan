import MailClient from '../cutting-edge-mail-client';
import * as Senders from '../cutting-edge-mail-client/sender';
import * as Receivers from '../cutting-edge-mail-client/receiver';
import { MessageSubscriber, IncomingMail, ReceivedMessage } from '../types';
import { Logger, Fragment } from 'koishi';
type Separator = string;
export declare class Bridge {
    #private;
    client: MailClient;
    subscribers: Set<MessageSubscriber>;
    logger: Logger;
    get separator(): Separator;
    set separator(value: Separator);
    useClient(mailClient: MailClient): void;
    useSender(sender: Senders.BaseSender): Promise<void>;
    useReceiver(receiver: Receivers.BaseReceiver): Promise<void>;
    bridge(): void;
    subscribe(subscriber: MessageSubscriber): void;
    unsubscribe(subscriber: MessageSubscriber): void;
    handleReceivedMail(mail: IncomingMail): Promise<void>;
    toMessage(mail: IncomingMail): Promise<ReceivedMessage | undefined>;
    sendMessage({ to, from, content }: {
        to: {
            id: string;
            name?: string;
        };
        from: {
            id: string;
            name?: string;
        };
        content: Fragment;
    }): Promise<void>;
}
export type BridgeOptions = ConstructorParameters<typeof Bridge>;
export {};

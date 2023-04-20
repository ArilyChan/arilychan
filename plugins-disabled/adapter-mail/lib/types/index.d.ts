import { segment } from 'koishi';
import _Mail from 'nodemailer/lib/mailer';
export interface MailAddressInterface<Local extends boolean = boolean> {
    local?: Local;
    name?: string;
    address: string;
}
export interface LocalMailAddressInterface extends MailAddressInterface<true> {
    local: true;
    folders?: string[];
}
export interface Mail extends Omit<_Mail.Options, 'from' | 'to' | 'html'> {
    from: MailAddressInterface;
    to: MailAddressInterface | MailAddressInterface[];
    html?: string;
}
export interface OutgoingMail extends Mail {
    from: LocalMailAddressInterface;
}
export interface IncomingMail extends Mail {
    to: LocalMailAddressInterface | LocalMailAddressInterface[];
}
export interface ReceivedMessage {
    from: {
        name?: string;
        id: string;
    };
    elements: segment[];
    id?: string;
}
export type MailSubscriber = (mail: IncomingMail) => void;
export type MessageSubscriber = (message: ReceivedMessage) => void;

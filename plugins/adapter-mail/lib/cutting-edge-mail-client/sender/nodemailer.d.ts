import nodemailer from 'nodemailer';
import { OutgoingMail } from '../../types';
import { BaseSender } from './base-sender';
import { LocalMailAddress } from '../address';
import { Logger } from 'koishi';
type SMTPConfig = {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
};
export declare class NodeMailer extends BaseSender {
    #private;
    logger: Logger;
    mail: LocalMailAddress;
    conn: nodemailer.Transporter;
    constructor(arg: SMTPConfig, address: LocalMailAddress);
    prepare(): Promise<void>;
    send(mail: OutgoingMail): Promise<any>;
}
export {};

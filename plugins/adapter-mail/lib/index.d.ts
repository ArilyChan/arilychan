import { Context, Schema } from 'koishi';
import { Config } from './adapter';
export declare const schema: Schema<({
    name?: string | undefined;
    address?: string | undefined;
} & import("cosmokit").Dict<any, string>) | ({
    senderProtocol?: string | undefined;
} & import("cosmokit").Dict<any, string>) | ({
    receiverProtocol?: string | undefined;
} & import("cosmokit").Dict<any, string>), {
    name: string;
    address: string;
} & import("cosmokit").Dict<any, string> & {
    senderProtocol: string;
} & {
    receiverProtocol: string;
}>;
export type Options = {
    address: string;
    name: string;
} & ({
    senderProtocol: 'dummy';
} | {
    senderProtocol: 'disabled';
} | {
    senderProtocol: 'node-mailer-smtp';
    sender: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
}) & ({
    receiverProtocol: 'dummy';
} | {
    receiverProtocol: 'disabled';
} | {
    receiverProtocol: 'imap';
    receiver: {
        user: string;
        password: string;
    };
});
export declare const name = "adapter-mail";
export declare function apply(ctx: Context, config: Config): void;

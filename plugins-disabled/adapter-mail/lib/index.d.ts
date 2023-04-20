import { Context, Schema } from 'koishi';
import { Config } from './adapter';
export declare const schema: Schema<Schemastery.ObjectS<{
    name: Schema<string, string>;
    address: Schema<string, string>;
}> | Schemastery.ObjectS<{
    sender: Schema<string, string>;
}> | Schemastery.ObjectS<{
    receiver: Schema<string, string>;
}>, {
    name: string;
    address: string;
} & import("cosmokit").Dict<any, string> & {
    sender: string;
} & {
    receiver: string;
}>;
export type Options = {
    address: string;
    name: string;
} & ({
    sender: 'dummy';
} | {
    sender: 'disabled';
} | {
    sender: 'nodemailer-smtp';
    nodemailer: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
}) & ({
    receiver: 'dummy';
} | {
    receiver: 'disabled';
} | {
    receiver: 'imap';
    imap: {
        user: string;
        password: string;
    };
});
export declare const name = "adapter-mail";
export declare function apply(ctx: Context, config: Config): void;

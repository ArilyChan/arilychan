import { IncomingMail } from '../types';
import { segment } from 'koishi';
export declare function pipeline({ separator, messageIdExtractor }?: {
    separator?: string;
    messageIdExtractor?: RegExp;
}): (mail: IncomingMail) => Promise<{
    content: segment[];
    id: string | undefined;
} | undefined>;

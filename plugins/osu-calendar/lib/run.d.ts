import { Session } from 'koishi';
import Fortune from './lib/Fortune';
export { Fortune };
export declare function koishiHandler(meta: Session, eventPath: string): Promise<string>;

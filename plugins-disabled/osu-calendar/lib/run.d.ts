import { Session } from 'koishi';
import Fortune from './bin/Fortune';
export { Fortune };
export declare function koishiHandler(meta: Session, eventPath: string): Promise<string>;

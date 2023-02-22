import { Session } from 'koishi';
import { Options } from '../';
export default function tryUser(options: Options): {
    tryUser(user: string | undefined, session: Session<never, never> & {
        user: {
            osu: Record<string, any>;
        };
    }, server?: string): string | undefined;
};

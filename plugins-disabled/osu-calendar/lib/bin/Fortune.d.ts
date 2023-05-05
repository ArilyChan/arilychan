import { OsuCalendarEvents } from '../types/store';
import FortuneBinding from './FortuneBinding';
declare class Fortune {
    events: Record<string, any>;
    constructor(events: OsuCalendarEvents);
    binding(who: any): FortuneBinding;
}
export default Fortune;

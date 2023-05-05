import { OsuCalendarEvents } from '../types/store';
import { XorShift } from 'xorshift';
declare class FortuneDailyResult {
    seedString: string;
    today: Date;
    seed: number;
    luck: unknown;
    mods: unknown;
    modsSpecial: unknown;
    activities: unknown;
    rng: XorShift;
    constructor(qqId: string, events: OsuCalendarEvents, day?: Date);
    get result(): {
        date: Date;
        luck: any;
        mod: any;
        specialMod: any;
        goodList: any;
        badList: any;
    };
    getStatList(): {
        date: Date;
        luck: any;
        mod: any;
        specialMod: any;
        goodList: any;
        badList: any;
    };
    getRandomArray(array: any, size?: number): any;
}
export default FortuneDailyResult;

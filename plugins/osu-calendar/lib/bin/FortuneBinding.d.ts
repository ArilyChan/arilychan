import Activity from './Activity';
import Fortune from './Fortune';
declare class FortuneBinding {
    me: string;
    fortune: any;
    constructor(me: string, fortune: Fortune);
    when(date: ConstructorParameters<typeof Date>[0]): Activity;
    get today(): Activity;
    from(from: ConstructorParameters<typeof Date>[0]): {
        to(to: ConstructorParameters<typeof Date>[0]): Activity[];
    };
}
export default FortuneBinding;

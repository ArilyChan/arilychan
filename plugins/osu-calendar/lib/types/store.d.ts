export declare enum Act {
    Add = "add"
}
export interface Activity {
    name: string;
    good: string;
    bad: string;
    act?: Act;
}
export interface OsuCalendarEvents {
    luck: string[];
    mods: string[];
    modsSpecial: string[];
    activities: Activity[];
    pending: Activity[];
}

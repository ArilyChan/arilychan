import { Options } from '../index';
export default function TryMode(options: Options): {
    validateOP: (op: any, session: any) => any;
    transformModeOP: (op: any) => any;
    transformMode: (mode: any) => any;
    validateMode(mode: any, server: any): any;
};

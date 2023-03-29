import { MailAddressInterface, LocalMailAddressInterface } from '../../types';
declare const customInspectSymbol: unique symbol;
export declare class MailAddress implements MailAddressInterface<boolean> {
    name: string;
    address: string;
    local?: boolean;
    static _printName: string;
    constructor({ name, address, local }: MailAddressInterface<boolean>);
    [customInspectSymbol](_: any, inspectOptions: any, __: any): string;
    toString(): string;
    extend(e: MailAddressInterface): MailAddress;
}
export declare class LocalMailAddress extends MailAddress implements LocalMailAddressInterface {
    folders: any;
    local: true;
    static _printName: string;
    constructor({ name, address, folders }: MailAddressInterface & Partial<LocalMailAddressInterface>);
    [customInspectSymbol](depth: any, inspectOptions: any, inspect: any): string;
}
export {};

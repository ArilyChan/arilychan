"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalMailAddress = exports.MailAddress = void 0;
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
class MailAddress {
    constructor({ name, address, local }) {
        this.name = 'unknown';
        this.name = name || this.name;
        this.address = address;
        this.local = local;
    }
    [customInspectSymbol](_, inspectOptions, __) {
        const { stylize } = inspectOptions;
        const formattedAddress = stylize(`<${`${stylize(this.name ?? '', 'null')}`}${stylize(`<${this.address}>`, 'string')}>`, 'module');
        // @ts-expect-error not so sure about this.
        return `${stylize(this.constructor._printName, 'special')}${formattedAddress}`;
    }
    toString() {
        return `${this.name} <${this.address}>`;
    }
    extend(e) {
        return new MailAddress({
            name: this.name,
            // @ts-expect-error intended
            address: this.address,
            local: this.local,
            ...e
        });
    }
}
exports.MailAddress = MailAddress;
MailAddress._printName = 'Mail';
class LocalMailAddress extends MailAddress {
    constructor({ name, address, folders }) {
        super({ name, address });
        this.local = true;
        this.folders = folders;
    }
    [customInspectSymbol](depth, inspectOptions, inspect) {
        const rtn = super[customInspectSymbol](depth, inspectOptions, inspect);
        return `${rtn}${inspect({
            folders: this.folders
        }, inspectOptions)}`;
    }
}
exports.LocalMailAddress = LocalMailAddress;
LocalMailAddress._printName = 'LocalMail';

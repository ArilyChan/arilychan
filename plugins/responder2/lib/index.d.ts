import { Context, Schema, Session } from 'koishi';
export type Variable = string | {
    type: 'object-destructuring' | 'array-destructuring';
    destructed: string;
    variables: Variable[];
} | {
    type: 'rename';
    from: string;
    to: string;
};
export interface Literal {
    type: 'literal';
    value: string;
}
export interface Executable {
    type: 'exec';
    async: boolean;
    inline: boolean;
    code: string;
    variables?: Variable[];
}
export type ConditionalMatcher = ({
    type: 'startsWith' | 'includes';
} | {
    type: 'equals';
    eq: string;
}) & {
    content: string;
};
export interface Command {
    type: string;
    cond: Executable | ConditionalMatcher;
    action: Executable | Literal;
}
export type returnedValue = any;
type Awaitable<T> = Promise<T> | T;
export type CustomMatcher = (session: Session, context: Context, resolve: (carry: returnedValue) => void, reject: () => void) => Awaitable<returnedValue>;
export type ActionFunction = (session: Session, context: Context, returnedValue: returnedValue) => Awaitable<string | undefined | {
    toString: () => string;
}>;
export type MatchFunction = CustomMatcher;
export type Entry = [MatchFunction, ActionFunction];
export declare function commandBuilder(logger: any): [Entry[], CallableFunction];
export declare const name = "yet-another-responder";
export declare const schema: Schema<{
    rules?: ({} & import("cosmokit").Dict<any, string>)[];
} & import("cosmokit").Dict<any, string>, {
    rules: ({} & import("cosmokit").Dict<any, string>)[];
} & import("cosmokit").Dict<any, string>>;
export interface Options {
    rules: Array<{
        enabled: boolean;
        content: string;
    }>;
}
export declare function apply(ctx: Context, options: Options): void;
export {};

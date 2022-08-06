import { Context, Schema, Session } from 'koishi';
export declare type Variable = string | {
    type: 'object-destructuring' | 'array-destructuring';
    destructed: string;
    variables: Variable[];
} | {
    type: 'rename';
    from: string;
    to: string;
};
export interface literal {
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
export declare type ConditionalMatcher = ({
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
    action: Executable | literal;
}
export declare type returnedValue = any;
export declare type CustomMatcher = (session: Session, context: Context, resolve: (carry: returnedValue) => void, reject: () => void) => Promise<returnedValue> | returnedValue;
export declare type ActionFunction = (session: Session, context: Context, returnedValue: returnedValue) => Promise<string | undefined | {
    toString: () => string;
}> | string | {
    toString: () => string;
};
export declare type MatchFunction = CustomMatcher;
export declare type Entry = [MatchFunction, ActionFunction];
export declare function commandBuilder(logger: any): [Entry[], CallableFunction];
export declare const name = "yet-another-responder";
export declare const schema: Schema<{
    rules?: string[];
} & import("cosmokit").Dict<any, string>, {
    rules: string[];
} & import("cosmokit").Dict<any, string>>;
export interface Options {
    rules: string[];
}
export declare function apply(ctx: Context, options: Options): void;

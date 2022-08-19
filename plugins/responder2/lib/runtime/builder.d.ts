import { Variable } from '../';
export interface BuilderOptions {
    async: boolean;
    inline: boolean;
    isMatcher?: boolean;
    isAction?: boolean;
}
export declare const rebuildVariableString: (variable: Variable) => any;
export declare function build(code: string, variables: Variable[], options: BuilderOptions): Function;

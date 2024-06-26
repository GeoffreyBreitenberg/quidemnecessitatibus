/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/ts-action
 */

import { Action } from "../common/types";
import { ActionCreator, Creator } from "./action";

export type Reducer<S> = (state: S | undefined, action: Action<string>) => S;

export function on<C extends ActionCreator<string, Creator>, S>(ctor: C, reducer: (state: S, action: ReturnType<C>) => S): { reducer: Reducer<S>, types: string[] };
export function on<C extends { [key: string]: ActionCreator<string, Creator> }, S>(ctors: C, reducer: (state: S, action: ReturnType<C[keyof C]>) => S): { reducer: Reducer<S>, types: string[] };
export function on<S>(c: any, reducer: any): { reducer: Reducer<S>, types: string[] } {
    const types = typeof c === "function" ?
        [c.type] :
        Object.keys(c).reduce((t, k) => [...t, c[k].type], [] as string[]);
    return { reducer, types };
}

export function reducer<S>(ons: { reducer: Reducer<S>, types: string[] }[], initialState: S): Reducer<S> {
    const map = new Map<string, Reducer<S>>();
    ons.forEach(on => on.types.forEach(type => map.set(type, on.reducer)));
    return function (state: S = initialState, action: Action<string>): S {
        const reducer = map.get(action.type);
        return reducer ? reducer(state, action) : state;
    };
}

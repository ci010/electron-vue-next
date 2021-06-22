/* eslint-disable no-use-before-define */
export interface BaseState { }
export interface BaseGetters { }
export interface BaseMutations { }
export interface BaseActions { }
export interface ModuleMap { }

type ModUnion = Required<ModuleMap[keyof ModuleMap]>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// type ActionDefinitions = {
//     [key: string]: ((payload: any) => any) | any;
// }
type MutationsDefinitions = {
    [key: string]: any;
}
type GetterDefinition = {
    [key: string]: (() => any) | any;
}

type StateTree = { [K in keyof ModuleMap]: Required<ModuleMap[K]>['state'] };
export interface RootState extends StateTree, BaseState { }

type MutationRestriction<M extends MutationsDefinitions, S = {}> = {
    [key in keyof M]: (state: S, payload: M[key]) => void;
}
type GetterRestriction<G extends GetterDefinition, S = {}> = {
    [key in keyof G]: (state: S, getters: G, rootState: RootState, rootGetters: any) => G[key];
}
// type ActionRestriction<A extends ActionDefinitions, S = {}, G = {}> = {
//     [key in keyof A]: (context: { state: S; getters: G; commit: RootCommit; dispatch: RootDispatch; rootState: RootState; rootGetters: RootGetters }, payload: Parameters<A[key]>[0]) => Promise<ReturnType<A[key]>>;
// }

type InverseGetterRestriction<G extends GetterRestriction<any, any>> = { [key in keyof G]: ReturnType<G[key]>; }
type AllModulesGetters = UnionToIntersection<InverseGetterRestriction<ModulesGetters>>
export interface RootGetters extends BaseGetters, AllModulesGetters { }

type Commit<M extends MutationRestriction<any, any>> = { <T extends keyof M>(type: T, payload?: Parameters<M[T]>[1]): void }
export interface RootCommit extends Commit<UnionToIntersection<ModulesMutations>>, Commit<MutationRestriction<BaseMutations>> { }

// type DispatchFromDef<A extends ActionDefinitions> = { <T extends keyof A>(type: T, payload?: Parameters<A[T]>[0]): Promise<ReturnType<A[T]>> }
// type Dispatch<A extends ActionRestriction<any, any, any>> = { <T extends keyof A>(type: T, payload?: Parameters<A[T]>[1]): ReturnType<A[T]> }
// export interface RootDispatch extends DispatchFromDef<BaseActions>, Dispatch<UnionToIntersection<ModulesActions>> { }

type ModulesGetters = ModUnion['getters'];
type ModulesMutations = ModUnion['mutations'];
// type ModulesActions = ModUnion['actions'];

export interface ModuleOption<
    S,
    G extends GetterDefinition,
    M extends MutationsDefinitions> {
    state?: S;
    getters?: GetterRestriction<G, S>;
    mutations?: MutationRestriction<M, S>;
}

export interface Store {
    state: RootState;
    getters: RootGetters;
    commit: RootCommit;
}

export type MutationKeys = keyof UnionToIntersection<ModulesMutations> | keyof BaseMutations;

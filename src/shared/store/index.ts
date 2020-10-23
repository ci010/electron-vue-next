/* eslint-disable no-unused-vars */
import { StoreOptions } from 'vuex'
import { BaseGetters, BaseMutations, BaseState, RootState } from './definition'
import bar, { BarModule } from './modules/bar'
import foo, { FooModule } from './modules/foo'

declare module './definition' {

  interface ModuleMap {
    foo: FooModule
    bar: BarModule
  }

  interface BaseState {
    // define base state here
  }
  interface BaseMutations {
    // define base mutations here
  }
}

const state: BaseState = {}
const getters: BaseGetters = {}
const mutations: BaseMutations = {}

const store = {
  state,
  getters,
  mutations,
  modules: {
    foo,
    bar
  }
}

export default store as any as StoreOptions<RootState>

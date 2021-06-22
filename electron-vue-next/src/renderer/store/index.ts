/* eslint-disable no-unused-vars */
import { createStore, StoreOptions } from 'vuex'
import bar from './modules/bar'
import foo from './modules/foo'

export interface RootState {
}

const store: StoreOptions<RootState> = {
  state: {},
  getters: {},
  mutations: {},
  modules: {
    foo,
    bar
  }
}

export default createStore(store)

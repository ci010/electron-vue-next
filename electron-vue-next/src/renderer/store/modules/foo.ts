import { Module } from "vuex"
import { RootState } from ".."

export interface State {
  count: number
}

const mod: Module<State, RootState> = {
  state: {
    count: 0
  },
  getters: {
  },
  mutations: {
    increment: state => state.count++,
    decrement: state => state.count--
  }
}

export default mod

import { Module } from 'vuex'
import { RootState } from '..'

export interface State {
  value: number;
  name: string;
}

const mod: Module<State, RootState> = {
  state: {
    value: 0,
    name: ''
  },
  getters: {
    valueAndName: state => state.name + ' ' + state.value
  },
  mutations: {
    setValueAndName: (state, { name, value }) => { state.name = name; state.value = value }
  }
}

export default mod

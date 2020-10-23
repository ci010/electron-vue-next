import { ModuleOption } from '../definition'

interface State {
  count: number
}

interface Getters {
}

interface Mutations {
  increment: void
  decrement: void
}

export type FooModule = ModuleOption<State, Getters, Mutations>;

const mod: FooModule = {
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

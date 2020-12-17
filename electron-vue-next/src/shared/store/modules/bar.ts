import { ModuleOption } from '../definition'

interface State {
  value: number;
  name: string;
}

interface Getters {
  valueAndName: string
}

interface Mutations {
  setValueAndName: { value: number; name: string }
}

export type BarModule = ModuleOption<State, Getters, Mutations>;

const mod: BarModule = {
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

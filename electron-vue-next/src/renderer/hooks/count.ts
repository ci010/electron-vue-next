import { computed } from 'vue'
import { useStore } from './store'

export function useCount() {
  const { state, commit } = useStore()
  const count = computed(() => state.foo.count)
  const increment = () => commit('increment')
  return {
    count,
    increment
  }
}

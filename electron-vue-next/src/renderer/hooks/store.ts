import { useStore as _useStore } from 'vuex'
import { RootCommit, RootGetters, RootState } from '/@shared/store/definition'

export function useStore() {
  const store = _useStore<RootState>()
  return {
    state: store.state,
    getters: store.getters as RootGetters,
    commit: store.commit as RootCommit,
    dispatch: store.dispatch
  }
}

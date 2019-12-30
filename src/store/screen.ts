import * as Vuex from 'vuex';

export interface ScreenState {
  width: number
}

const store = new Vuex.Store<ScreenState>({
  state: {
    width: window.innerWidth,
  },
  mutations: {
    setWidth (state: ScreenState, width: number) {
      state.width = width
    }
  }
})

window.addEventListener('resize', () => {
  store.commit('setWidth', window.innerWidth)
})

export default store;
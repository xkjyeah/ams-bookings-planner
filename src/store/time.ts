
interface TimeStoreState {
  time: number
}

export default {
  namespaced: true,

  state (): TimeStoreState {
    return {
      time: Date.now(),
    }
  },

  mutations: {
    updateTime (state: TimeStoreState) {
      state.time = Date.now()
    }
  }
}

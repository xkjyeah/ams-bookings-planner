
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

  getters: {
    msSinceMidnight (state: TimeStoreState) {
      const d = new Date(state.time)
      d.setHours(0, 0, 0, 0)
      return state.time - d.getTime()
    }
  },

  mutations: {
    updateTime (state: TimeStoreState) {
      state.time = Date.now()
    }
  }
}

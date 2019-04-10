
export interface DialogsState {
  activeDialog: string | null
}

export default {
  namespaced: true,

  state (): DialogsState {
    return {
      activeDialog: 'persons',
    }
  },

  mutations: {
    showDialog(state: DialogsState, team: string) {
      state.activeDialog = team
    },

    hideDialog(state: DialogsState) {
      state.activeDialog = null
    }
  },
}

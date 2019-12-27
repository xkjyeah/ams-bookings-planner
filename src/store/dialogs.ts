
export interface DialogsState {
  activeDialog: string | null,
  props: {[key: string]: any},
}

export default {
  namespaced: true,

  state (): DialogsState {
    return {
      activeDialog: null,
      props: {},
    }
  },

  mutations: {
    showDialogWithProps(state: DialogsState, {dialog, props}: {dialog: string, props: {[key: string]: any}}) {
      state.activeDialog = dialog
      state.props = props
    },

    showDialog(state: DialogsState, team: string) {
      state.activeDialog = team
    },

    hideDialog(state: DialogsState) {
      state.activeDialog = null
    }
  },
}

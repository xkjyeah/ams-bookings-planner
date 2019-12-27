import { auth } from '@/lib/firebase';

interface LoginState {
  user: string | null,
}

export default {
  namespaced: true,

  state (): LoginState {
    return {
      user: null
    }
  },

  actions: {
    signInWithPopup(context: any, provider: firebase.auth.AuthProvider) {
      return auth.signInWithPopup(provider)
    },
    signOut(context: any) {
      auth.signOut()
    }
  },

  mutations: {
    updateUser (state: LoginState, user: string | null) {
      state.user = user
    }
  }
}

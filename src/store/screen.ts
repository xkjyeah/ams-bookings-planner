import * as Vuex from 'vuex';
import time from './time';

export interface ScreenState {
  width: number,
  scrollTime: number,
}

const store = {
  namespaced: true,
  state: {
    width: window.innerWidth,
    scrollTime: 0,
  },
  mutations: {
    setWidth (state: ScreenState, width: number) {
      state.width = width
    },
    setScrollTime (state: ScreenState, scrollTime: number) {
      state.scrollTime = scrollTime
    },
  }
}

export default store;
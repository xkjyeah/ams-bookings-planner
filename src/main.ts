import Vue from 'vue'
import App from './App.vue'
import store from './store'
import defaultData from '@/assets/default-data';

Vue.config.productionTip = false

// initialize data
store.commit('trips/importJobs', defaultData())

new (Vue as any)({
  store,
  render: (h: any) => h(App)
}).$mount('#app')

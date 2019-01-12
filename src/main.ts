import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import store from './store'
import defaultData from '@/assets/default-data';


Vue.config.productionTip = false

// Vuetify imports
Vue.use(Vuetify)
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// initialize data
store.commit('trips/importJobs', defaultData())

new (Vue as any)({
  store,
  render: (h: any) => h(App)
}).$mount('#app')

import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import store from './store'
import defaultData from '@/assets/default-data';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false

// Vuetify imports
Vue.use(Vuetify)
;(Vue as any).use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDesj7zbyR3W906S_H3rq-y2Ao3_yh7qRI',
    libraries: ['places'],
  }
})
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// initialize data
store.commit('trips/importJobs', defaultData())

new (Vue as any)({
  store,
  render: (h: any) => h(App)
}).$mount('#app')

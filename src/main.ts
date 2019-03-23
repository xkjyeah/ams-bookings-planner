import Vue from '@/vue-with-plugins'
import Vuetify from 'vuetify'
import App from './App.vue'
import store from './store'
import Vault from '@/vault'
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false

// Vuetify imports
Vue.use(Vuetify)
;(Vue as any).use(VueGoogleMaps, {
  load: {
    key: Vault.googleMapsApiKey,
    libraries: ['places'],
  }
})

// draggable is not settable on the element, is it?
Vue.directive('draggable', {
  bind (el: HTMLElement) {
    el.draggable = true
  }
})

import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

new (Vue as any)({
  store,
  render: (h: any) => h(App)
}).$mount('#app')

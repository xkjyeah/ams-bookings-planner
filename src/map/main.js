import Vue from 'vue'
import App from './App.vue'
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

Vue.use(require('vue2-google-maps'), {
  load: {
    key: 'AIzaSyBvWE_sIwKbWkiuJQOf8gSk9qzpO96fhfY'
  }
})

new Vue({
  el: '#app',
  render: h => h(App)
})

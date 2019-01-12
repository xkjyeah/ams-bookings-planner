import Vue from 'vue'
import Vuex from 'vuex'
import Time from '@/store/time.ts'
import Trips from '@/store/trips.ts'
import TripEditing from '@/store/tripEditing.ts'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    time: Time,
    trips: Trips,
    tripEditing: TripEditing,
  },
})

import Vuex from 'vuex'
import Screen from '@/store/screen.ts'
import Time from '@/store/time.ts'
import Trips from '@/store/trips.ts'
import TripEditing from '@/store/tripEditing.ts'

export default new Vuex.Store({
  modules: {
    screen: Screen,
    time: Time,
    trips: Trips,
    tripEditing: TripEditing,
  },
})

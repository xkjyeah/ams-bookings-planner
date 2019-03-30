import Vuex from 'vuex'
import Screen from '@/store/screen.ts'
import Time from '@/store/time.ts'
import Trips from '@/store/trips.ts'
import Vehicles from '@/store/vehicles.ts'
import Dialogs from '@/store/dialogs.ts'
import TripEditing from '@/store/tripEditing.ts'

export default new Vuex.Store({
  modules: {
    screen: Screen,
    time: Time,
    trips: Trips,
    dialogs: Dialogs,
    vehicles: Vehicles,
    tripEditing: TripEditing,
  },
})

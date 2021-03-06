import Vuex from 'vuex'
import Screen from '@/store/screen.ts'
import Time from '@/store/time.ts'
import Trips from '@/store/trips.ts'
import Vehicles from '@/store/vehicles.ts'
import Dialogs from '@/store/dialogs.ts'
import TripEditing from '@/store/tripEditing.ts'
import Templates from '@/store/templates';
import Login from './store/login';

const store = new Vuex.Store({
  modules: {
    screen: Screen,
    time: Time,
    login: Login,
    trips: Trips,
    dialogs: Dialogs,
    vehicles: Vehicles,
    tripEditing: TripEditing,
    templates: Templates,
  },
})

window.addEventListener('resize', () => {
  store.commit('screen/setWidth', window.innerWidth)
})

export default store;
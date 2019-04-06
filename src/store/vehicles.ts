import _ from 'lodash'

export interface VehicleStatus {
  created: number,
  direction: number,
  lat: number,
  lng: number,
  location: string,
  registrationNumber: string,
  speed: number,
  vehicleStatus: string,
}

export interface VehiclesState {
  vehicles: VehicleStatus[]
}

export default {
  namespaced: true,

  state (): VehiclesState {
    return {
      vehicles: []
    }
  },

  getters: {
    vehiclesById(state: VehiclesState) {
      return _.keyBy(state.vehicles, 'registrationNumber')
    }
  },

  mutations: {
    setVehicles(state: VehiclesState, vehicles: VehicleStatus[]) {
      state.vehicles = vehicles
    }
  },
}

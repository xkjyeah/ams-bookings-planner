import _ from 'lodash'
import {db} from '@/lib/firebase'
import assert from 'assert'

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

export interface Person {
  name: string,
  telephone: string | null,
  updated: number,
  created: number,
}

export type PersonList = {
  [name: string]: Person
}

export interface VehiclesState {
  vehicles: VehicleStatus[],
  persons: PersonList,
}

export default {
  namespaced: true,

  state (): VehiclesState {
    return {
      vehicles: [],
      persons: {},
    }
  },

  getters: {
    vehiclesById(state: VehiclesState) {
      return _.keyBy(state.vehicles, 'registrationNumber')
    },

    personArray(state: VehiclesState): Person[] {
      return _.sortBy(
        Object.values(state.persons),
        (p: Person) => p.name
      )
    }
  },

  mutations: {
    setVehicles(state: VehiclesState, vehicles: VehicleStatus[]) {
      state.vehicles = vehicles
    },

    setPersons(state: VehiclesState, persons: PersonList) {
      state.persons = persons
    },

    updatePerson(state: VehiclesState, person: Person) {
      state.persons = {
        ...state.persons,
        [person.name]: person,
      }
      syncPerson(person)
    },

    deletePerson(state: VehiclesState, person: Person) {
      const {[person.name]: toDelete, ...rest} = state.persons
      state.persons = rest

      syncDeletePerson(person)
    }
  },
}

function syncPerson(person: Person) {
  assert(person.name)

  db.ref(`/persons/${person.name}`)
  .set({
    ...person,
    updated: Date.now(),
    created: Date.now(),
  })
}

function syncDeletePerson(person: Person) {
  assert(person.name)

  db.ref(`/persons/${person.name}`)
  .set(null)
}

export function vehicleStatusIsStale(status: VehicleStatus) {
  return (Date.now() - status.created) > 15 * 60e3
}
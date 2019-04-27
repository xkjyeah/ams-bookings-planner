import {Job, Trip, KeyableTrip} from '@/lib/types'
import trips, { TripsState, tripKey } from './trips'
import assert from 'assert'
import * as Vuex from 'vuex'
import uniqueId from '@/lib/uniqueId';

export interface TripEditingState {
  teamBeingEdited: KeyableTrip | null,
  tripIndexBeingEdited: number,
}

/**
 * This stores the state needed to link the popup window with
 * the currently being edited state.
 */
export default {
  namespaced: true,
  state (): TripEditingState {
    return {
      teamBeingEdited: null,
      tripIndexBeingEdited: 0,
    }
  },

  getters: {
    tripBeingEdited (
      state: TripEditingState,
      getters: any,
      rootState: {trips: TripsState}
    ): Trip | null {
      const key = state.teamBeingEdited &&
        tripKey(state.teamBeingEdited)

      if (!key) return null
      const trip = rootState.trips.scheduleByTeam[key] &&
        rootState.trips.scheduleByTeam[key].trips[state.tripIndexBeingEdited]

      if (!trip) console.warn(`Editing trip by ${key} index ${state.tripIndexBeingEdited}` +
        ` However the trip was not found`)

      return trip || null
    }
  },

  mutations: {
    editTrip (
      state: TripEditingState,
      options: {team: KeyableTrip, index: number} | null
    ) {
      if (options) {
        state.teamBeingEdited = options.team
        state.tripIndexBeingEdited = options.index
      } else {
        state.teamBeingEdited = null
        state.tripIndexBeingEdited = 0
      }
    },
  },

  actions: {
    updateTripBeingEdited (
      context: any,
      updates: {[key: string]: any},
    ) {
      assert(
        context.getters.tripBeingEdited,
        'There is no valid trip being edited'
      )

      context.commit(
        'trips/updateTrip',
        {
          team: (context.state as TripEditingState).teamBeingEdited,
          index: (context.state as TripEditingState).tripIndexBeingEdited,
          updates,
        },
        {root: true}
      )
    },

    editLatestTripOfTeam (
      context: any,
      options: {team: KeyableTrip}
    ) {
      context.commit('tripEditing/editTrip', {
        team: options.team,
        index: (context.rootState.trips as TripsState)
          .scheduleByTeam[tripKey(options.team)]
          .trips.length - 1
      }, {root: true})
    },

    deleteTrip(context: Vuex.ActionContext<TripEditingState, {}>) {
      context.commit('trips/deleteTrip', {
        team: context.state.teamBeingEdited,
        tripIndex: context.state.tripIndexBeingEdited,
      }, {root: true})
      context.commit('tripEditing/editTrip', null, {root: true})
    },

    createAndEditNewTripAtTime(
      context: Vuex.ActionContext<TripEditingState, any>,
      options: {time: number, driver?: string | null, medic?: string | null},
    ) {
      const trip: Trip = {
        id: uniqueId(),
        driver: options.driver || null,
        medic: options.medic || null,
        startTime: options.time,
        endTime: null,
        startPostcode: null,
        endPostcode: null,
        startAddress: null,
        endAddress: null,
        startLocation: null,
        endLocation: null,
        startLatLng: null,
        endLatLng: null,
        created: Date.now(),
        isTentative: false,
        isReturnTrip: false,
        relatedTrip: null,
        description: 'New trip $100',
        cancelled: false,
        templateTrip: '',
      }

      context.commit('trips/assignNewlyCreatedJob', {trip}, {root: true})
      context.commit('tripEditing/editTrip', {
        team: {driver: trip.driver, medic: trip.medic},
        index: context.rootState.trips.scheduleByTeam[
          tripKey(trip)
        ].trips.length - 1
      }, {root: true})
    }
  }
}
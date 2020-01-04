import {Job, Trip, KeyableTrip} from '@/lib/types'
import trips, { TripsState, tripKey } from './trips'
import assert from 'assert'
import * as Vuex from 'vuex'
import uniqueId from '@/lib/uniqueId';

export interface TripEditingState {
  tripBeingEdited: string | null,
}

/**
 * This stores the state needed to link the popup window with
 * the currently being edited state.
 */
export default {
  namespaced: true,
  state (): TripEditingState {
    return {
      tripBeingEdited: null,
    }
  },

  getters: {
    tripBeingEdited (
      state: TripEditingState,
      getters: any,
      rootState: {trips: TripsState}
    ): Trip | null {
      const key = state.tripBeingEdited

      if (!key) return null
      return rootState.trips.trips[key]
    }
  },

  mutations: {
    editTrip (
      state: TripEditingState,
      options: {tripId: string} | null
    ) {
      if (options) {
        state.tripBeingEdited = options.tripId
      } else {
        state.tripBeingEdited = null
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
          tripId: (context.state as TripEditingState).tripBeingEdited,
          updates,
        },
        {root: true}
      )
    },

    deleteTrip(context: Vuex.ActionContext<TripEditingState, {}>) {
      context.commit('trips/deleteTrip',
        {tripId: context.state.tripBeingEdited},
        {root: true})
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
        updated: Date.now(),
        isTentative: false,
        isReturnTrip: false,
        relatedTrip: null,
        hideFromManifest: false,
        description: 'New trip $100',
        cancelled: false,
        templateTrip: '',
        lastSMSTimestamp: null,
      }

      context.commit('trips/assignNewlyCreatedJob', {trip}, {root: true})
      context.commit('tripEditing/editTrip',
        {tripId: trip.id},
        {root: true}
      )
    }
  }
}
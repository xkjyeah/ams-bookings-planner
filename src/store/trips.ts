import {Job, Trip, KeyableTrip} from '@/lib/types'
import _ from 'lodash'
import uniqueId from '@/lib/uniqueId';


function makeTripTeamKey(trip: KeyableTrip) {
  if (trip.driver && trip.medic) {
    return trip.driver.trim().toLowerCase() +
      ' ' +
      trip.medic.trim().toLowerCase()
  } else if (trip.driver) {
    return trip.driver.trim().toLowerCase()
  } else if (trip.medic) {
    return trip.medic.trim().toLowerCase()
  } else {
    return null
  }
}

function tripKey (trip: KeyableTrip) {
  const key = makeTripTeamKey(trip)
    return 'x' + (key || '')
}

/**
 * State contains duplication -- e.g. teams are
 * repeated in both the array (whence we derive
 * sort order) and in the map (for quick lookups).
 *
 * The mutations / actions are required to safeguard
 * modifications to ensure optimized accesses.
 */
export interface TripsState {
  scheduleByTeam: {
    [key: string]: {
      trips: Trip[]
    }
  },

  teams: KeyableTrip[]
}

export default {
  namespaced: true,

  state (): TripsState {
    return {
      scheduleByTeam: {},
      teams: [],
    }
  },

  getters: {
    trips (state: TripsState) {
      return _
    },

    teamSchedules (state: TripsState) {
      return state.teams.map(team => {
        const key = tripKey(team)
        return [team, state.scheduleByTeam[key] || {}]
      })
    }
  },

  mutations: {
    reorderTeam (state: TripsState, options: {oldIndex: number, newIndex: number}) {
      const {oldIndex, newIndex} = options

      if (oldIndex === newIndex) return
      else if (oldIndex < newIndex) {
        const spliced = state.teams.splice(options.oldIndex, 1)
        state.teams.splice(options.newIndex - 1, 0, ...spliced)
      } else {
        const spliced = state.teams.splice(options.oldIndex, 1)
        state.teams.splice(options.newIndex, 0, ...spliced)
      }
    },

    updateTeams (state: TripsState, teams: KeyableTrip[]) {
      state.teams = teams
    },

    importJobs (state: TripsState, jobs: Job[]) {
      // Jobs can be one-way / two-way
      const trips = _.flatten(jobs.map(job => {
        const firstTrip = job.trip && {id: uniqueId(), ...job, ...job.trip}
        const secondTrip = job.secondTrip && {id: uniqueId(), ...job, ...job.secondTrip}

        if (firstTrip && secondTrip) return [firstTrip, secondTrip]
        else if (firstTrip || secondTrip) return [(firstTrip || secondTrip)]
        else return []
      }))

      const teamByKey = _.mapValues(
        _.keyBy(
          trips,
          tripKey
        ),
        trip => ({ driver: trip.driver, medic: trip.medic })
      )

      const tripsByKey = _.groupBy(
        trips,
        tripKey
      )

      state.teams = _.values(teamByKey)
      state.scheduleByTeam = _.fromPairs(
        state.teams.map(team => {
          const key = tripKey(team)
          return [
            key,
            {
              trips: tripsByKey[key]
            }
          ]
        })
      )
    }
  }
}
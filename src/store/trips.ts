import {Job, Trip, KeyableTrip, LatLng, imputedEndTime} from '@/lib/types'
import _ from 'lodash'
import uniqueId from '@/lib/uniqueId';
import assert from 'assert'
import {db} from '@/lib/firebase'
import * as Firebase from 'firebase'
import dateformat from 'dateformat';
import querystring from 'querystring';

function makeTripTeamKey(trip: KeyableTrip) {
  if (!trip) return null
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

export function tripKey (trip: KeyableTrip) {
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
type ScheduleByTeam = {
  [key: string]: {
    trips: Trip[]
  }
}

export interface TripsState {
  scheduleByTeam: ScheduleByTeam,
  teams: KeyableTrip[],
  savesDisabled: Boolean,
  timestamp: number,
  inFlightPromise: Promise<any> | null,
}

export default {
  namespaced: true,

  state (): TripsState {
    return {
      scheduleByTeam: {},
      teams: [],
      savesDisabled: false,
      timestamp: Date.now(),
      inFlightPromise: null,
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
    },
  },

  mutations: {
    reorderTeam (state: TripsState, options: {oldIndex: number, newIndex: number}) {
      if (state.savesDisabled) return

      const {oldIndex, newIndex} = options

      if (oldIndex === newIndex) return
      else if (oldIndex < newIndex) {
        const spliced = state.teams.splice(options.oldIndex, 1)
        state.teams.splice(options.newIndex - 1, 0, ...spliced)
      } else {
        const spliced = state.teams.splice(options.oldIndex, 1)
        state.teams.splice(options.newIndex, 0, ...spliced)
      }
      syncTeams(new Date(state.timestamp), state.teams)
    },

    reassignJob (state: TripsState, options: {trip: Trip, team: KeyableTrip | null}) {
      if (state.savesDisabled) return
      if (options.team === null) return

      const fromSchedule = state.scheduleByTeam[tripKey(options.trip)]
      const toSchedule = state.scheduleByTeam[tripKey(options.team)]

      assert(fromSchedule, 'Trip does not exist in From')
      assert(toSchedule, 'Trip does not exist in To')

      // splice the trip
      const index = fromSchedule.trips.findIndex(trip =>
        trip.id === options.trip.id
      )
      assert(index !== -1)
      fromSchedule.trips.splice(index, 1)

      // re-insert
      const trip = {
        ...options.trip,
        driver: options.team.driver,
        medic: options.team.medic,
      }
      toSchedule.trips.push(trip)

      // syncSchedules(new Date(state.timestamp), state.scheduleByTeam)
      syncTrip(new Date(state.timestamp), trip)
    },

    updateTeams (state: TripsState, teams: KeyableTrip[]) {
      // FIXME: add checks to ensure teams don't disappear
      // and are not duplicated
      state.teams = teams
      syncTeams(new Date(state.timestamp), state.teams)
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
      const date = new Date(state.timestamp)
      // syncSchedules(date, state.scheduleByTeam)
      syncTeams(date, _.values(teamByKey))
      _.values(tripsByKey).forEach((trips: Trip[]) => {
        trips.forEach(trip => {
          syncTrip(date, trip)
        })
      })
    },

    updateTrip (
      state: TripsState,
      options: {team: KeyableTrip, index: number, updates: {[key: string]: any}}
    ) {
      if (state.savesDisabled) return

      // FIXME: Type safety?
      const trip: any = state.scheduleByTeam[tripKey(options.team)].trips[options.index]

      assert(trip)

      for (let key of Object.keys(options.updates)) {
        trip[key] = options.updates[key]
      }
      // FIXME: This is bad form! -- async actions
      // on global state inside a synchronous fn
      syncTrip(new Date(state.timestamp), trip)
    },

    _setTimestamp(state: TripsState, timestamp: number) {
      state.timestamp = timestamp
    },

    _disableSaves (state: TripsState, data: any) {
      state.savesDisabled = true
      state.inFlightPromise = data
    },

    _enableSaves (state: TripsState) {
      state.savesDisabled = false
    },

    _setSchedules(state: TripsState, schedule: ScheduleByTeam) {
      state.scheduleByTeam = schedule
      state.inFlightPromise = null
    }
  },

  actions: {
    setDate(context: any, date: Date) {
      const state = context.state as TripsState

      const teamsPromise = readTeams(date)
      const tripsPromise = readTrips(date)

      const promise = Promise.all([
        teamsPromise, tripsPromise
      ])
      .then(([initialTeams, trips]) => {
        if (promise == state.inFlightPromise) {
          const [teams, schedules] = generateSchedule(initialTeams, trips)
          context.commit('updateTeams', teams)
          // context.commit('') // No trips to commit?
          context.commit('_setSchedules', schedules)
          context.commit('_setTimestamp', date.getTime())
          context.commit('_enableSaves')
          const dateString = formatDate(date)
          window.history.pushState(null, dateString, '#' + querystring.stringify({date: dateString}))
        }
      })

      context.commit('_disableSaves', promise)
    }
  }

  // actions: {
  //   updateTripWithSync (context: any, options: any) {
  //     context.commit('updateTrip', options)
  //     syncTrip(trip)
  //   },
  //   reorderTeamWithSync (context: any, options: any) {
  //     context.commit('reorderTrip', options)
  //   },
  // }
}

function formatDate(date: Date) {
  return dateformat(date, 'yyyy-mm-dd')
}

function syncTeams(date: Date, teams: KeyableTrip[]) {
  console.log('syncTeams')
  db.ref(`/teams/${formatDate(date)}`)
    .set(serializeArray(teams))
}

function serializeArray<T>(o: T[]): {[key: string]: T} {
  return o.reduce(
    (acc, v, index) => {
      acc[index.toString().padStart(9, '0')] = v
      return acc
    },
    {} as {[key: string]: T}
  )
}

function deserializeArray(o: {[key: string]: any}): any[] {
  const keys = _.sortBy(
    Object.keys(o)
    .map((k: string): [string, number] => [k, parseInt(k)])
    .filter(([key, intKey]) => {
      if (!isFinite(intKey)) {
        console.error(`Encountered non-integer key ${key}`)
        return false
      }
      return true
    }),
    s => s[1]
  )

  return keys.map(s => o[s[0]])
}

function readTeams(date: Date): Promise<KeyableTrip[]> {
  return db.ref(`/teams/${formatDate(date)}`)
  .once('value')
  .then((values: Firebase.database.DataSnapshot) => {
    const v = values.val() || {}
    return deserializeArray(v)
      .map(teamRaw => ({
        driver: teamRaw.driver || null,
        medic: teamRaw.medic || null,
        vehicle: teamRaw.vehicle || null,
      }))
  })
}

// function syncSchedules(date: Date, schedules: ScheduleByTeam) {
//   console.log('syncSchedules')
//   db.ref(`/schedules/${formatDate(date)}`)
//     .set(
//       _.mapValues(schedules, (data: {trips:Trip[]}) => {
//         return {
//           trips: serializeArray(data.trips.map(t => t.id))
//         }
//       })
//     )
// }

function generateSchedule(
  teams: KeyableTrip[],
  trips: Trip[]
): [KeyableTrip[], ScheduleByTeam] {
  const teamByKey = _.mapValues(
    _.keyBy(
      teams,
      tripKey
    ),
    team => ({ driver: team.driver, medic: team.medic })
  )
  const tripsByKey = _.groupBy(
    trips,
    tripKey
  )

  // If there are trips with team not in teams,
  // add to teams
  const teamsToAppend = Object.keys(tripsByKey)
    .filter(key => !(key in teamByKey))
    .map(key => {
      const {driver, medic, vehicle} = tripsByKey[key][0]
      return {driver, medic, vehicle}
    })

  const newTeams = teams.concat(teamsToAppend)

  const schedule = _.fromPairs(
    newTeams.map(team => {
      const key = tripKey(team)
      return [
        key,
        {
          trips: tripsByKey[key]
        }
      ]
    })
  )

  return [
    newTeams,
    schedule,
  ]
}

/**
 * For trips that cannot be allocated for some reason to a team,
 * pack them in such a way
 */
function packTrips(trips: Trip[]): Trip[][] {
  const arrayOfTrips: Trip[][] = []

  const last = <T>(t: T[]) => t[t.length - 1]

  const sortedTrips = _.sortBy(trips, (t: Trip) => t.startTime)

  const conflictsWith = (a: Trip, b: Trip) => {
    return Math.min(imputedEndTime(a), imputedEndTime(b)) <=
      Math.max(a.startTime, b.startTime)
  }

  for (let trip of sortedTrips) {
    const nonConflicting = arrayOfTrips.find(trips =>
      !conflictsWith(trip, last(trips))
    )
    if (!nonConflicting) {
      arrayOfTrips.push([trip])
    } else {
      nonConflicting.push(trip)
    }
  }

  return arrayOfTrips
}

// TODO: We may want to partition by trips by date, and fetch them all
function syncTrip(date: Date, trip: Trip) {
  trip.id = trip.id || uniqueId()
  db.ref(`/trips/${formatDate(date)}/${trip.id}`).set(trip)
}

function parseLatLng(o: any): LatLng | null {
  if (!o) return null

  const lat = isFinite(o && o.lat)
    ? parseFloat(o.lat) : null
  const lng = isFinite(o && o.lng)
    ? parseFloat(o.lng) : null

  if (lat !== null && lng !== null) {
    return {lat, lng}
  } else {
    return null
  }
}

function readTrips(date: Date): Promise<JobTrip[]> {
  return db.ref(`/trips/${formatDate(date)}`)
  .once('value')
  .then(v => {
    const value = v.val() || {}
    return _.values(value)
      .map(tripRaw => ({
        driver: tripRaw.driver || null,
        medic: tripRaw.medic || null,
        startTime: isFinite(tripRaw.startTime)
          ? parseInt(tripRaw.startTime)
          : 12 * 3600e3,
        endTime: isFinite(tripRaw.endTime)
          ? parseInt(tripRaw.endTime)
          : null,
        id: tripRaw.id || uniqueId(),
        description: tripRaw.description || '<No description>',
        startPostcode: tripRaw.startPostcode || null,
        endPostcode: tripRaw.endPostcode || null,
        startAddress: tripRaw.startAddress || null,
        endAddress: tripRaw.endAddress || null,
        startLatLng: parseLatLng(tripRaw.startLatLng),
        endLatLng: parseLatLng(tripRaw.endLatLng),
        type: tripRaw.type || '<No type>',
        price: isFinite(tripRaw.price)
          ? parseInt(tripRaw.price)
          : null,
        cancelled: tripRaw.cancelled || false,
      }))
  })
}

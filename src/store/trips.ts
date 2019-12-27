import {Job, Team, KeyableTrip, LatLng, imputedEndTime, Trip} from '@/lib/types'
import _ from 'lodash'
import uniqueId from '@/lib/uniqueId';
import assert from 'assert'
import {db} from '@/lib/firebase'
import * as Firebase from 'firebase'
import dateformat from 'dateformat';
import querystring from 'querystring';
import Vue from 'vue';
import { pushModeToHistory } from '@/store/modes';

function makeTripTeamKey(trip: KeyableTrip) {
  if (!trip) return null
  if (trip.driver && trip.medic) {
    return trip.driver.toString().trim().toLowerCase() +
      ' ' +
      trip.medic.toString().trim().toLowerCase()
  } else if (trip.driver) {
    return trip.driver.toString().trim().toLowerCase()
  } else if (trip.medic) {
    return trip.medic.toString().trim().toLowerCase()
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
type ScheduleData = {
  trips: Trip[],
  rows: number[][],
}
export type ProcessedScheduleData = {
  trips: Trip[],
  tripIndices: number[],
  row: number,
  rowCount: number,
}

export type ScheduleByTeam = {
  [key: string]: ScheduleData
}

export type AppMode = {
  type: 'date',
  timestamp: number,
} | {
  type: 'template',
  template: string,
  lastTimestamp: number,
}

export type AutoUpdateTrips = {
  teams: Team[],
  teamsKey: string,
} | {
  trips: Trip[],
  tripsKey: string,
}

export interface TripsState {
  scheduleByTeam: ScheduleByTeam,
  teams: Team[],
  // Only to be used when switching between dates, for example.
  // because when switching between dates, there as in ambiguity
  // while requests are in flight as to which is the *current* day
  savesDisabled: Boolean,
  inFlightPromise: Promise<any> | null,

  autoUpdate: {
    teams: Team[],
    teamsKey: string,
    trips: Trip[],
    tripsKey: string,
  },

  mode: AppMode,
}

export default {
  namespaced: true,

  state (): TripsState {
    return {
      scheduleByTeam: {},
      teams: [],
      savesDisabled: false,
      mode: {
        type: 'date',
        timestamp: Date.now(),
      },
      inFlightPromise: null,
      autoUpdate: {
        teams: [],
        trips: [],
        teamsKey: 'a',
        tripsKey: 'b',
      }
    }
  },

  getters: {
    trips (state: TripsState) {
      return _.flatten(Object.values(state.scheduleByTeam)
        .map((v: ScheduleData) => v.trips))
    },

    rowCount (state: TripsState) {
      return _.sumBy(
        state.teams,
        team => state.scheduleByTeam[tripKey(team)]
          ? state.scheduleByTeam[tripKey(team)].rows.length
          : 0
        )
    },

    teamIndexForRow (state: TripsState): ((i: number) => number) {
      return (i: number) => {
        let offset = 0
        let index = 0
        for (let team of state.teams) {
          const rows = state.scheduleByTeam[tripKey(team)].rows
          if (i < offset + rows.length) {
            return index
          }
          offset += rows.length
          index += 1
        }
        throw new Error(`Couldn\'t find team for row ${i}`)
      }
    },

    teamForRow (state: TripsState): (i: number) => Team | null {
      return (i: number) => {
        let offset = 0
        for (let team of state.teams) {
          const rows = state.scheduleByTeam[tripKey(team)].rows
          if (i < offset + rows.length) {
            return team
          }
          offset += rows.length
        }
        return null
      }
    },

    canonicalOffsetForRow (state: TripsState): (i: number) => number | null {
      return (i: number) => {
        let offset = 0
        for (let team of state.teams) {
          const rows = state.scheduleByTeam[tripKey(team)].rows
          if (i < offset + rows.length) {
            return offset
          }
          offset += rows.length
        }
        return null
      }
    },

    teamSchedules (state: TripsState): [KeyableTrip, ProcessedScheduleData][] {
      const s = _.flatMap(
        state.teams,
        (team: Team) => {
          const key = tripKey(team)
          const schedule = state.scheduleByTeam[key] || {trips: [], rows: [[]]}

          // FOR DEBUGGING ONLY
          if (process.env.NODE_ENV !== 'production') {
            if (schedule.trips.length !== _.sumBy(schedule.rows, rs => rs.length)) {
              throw new Error('Trips length != elements in row!' + tripKey(team))
            }
          }

          return schedule.rows.map((indices: number[], rowIndex: number): [KeyableTrip, ProcessedScheduleData] => [
            team,
            {
              trips: indices.map(i => schedule.trips[i]),
              tripIndices: indices,
              row: rowIndex,
              rowCount: schedule.rows.length,
            }
          ])
        })
      return s
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
      syncTeams(state.mode, state.teams)
    },

    assignNewlyCreatedJob (state: TripsState, options: {trip: Trip}) {
      if (state.savesDisabled) return

      const {trip} = options
      const toSchedule = state.scheduleByTeam[tripKey(trip)]

      // If team doesn't exist, create the team?
      if (toSchedule) {
        toSchedule.trips.push(trip)
        toSchedule.rows = packTrips(toSchedule.trips)
      } else {
        const team = {
          driver: trip.driver,
          medic: trip.medic,
          vehicle: null,
        }
        state.teams.splice(0, 0, team)
        Vue.set(state.scheduleByTeam, tripKey(team), {
          trips: [trip],
          rows: [[0]],
        })
      }

      syncTrip(state.mode, trip)
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
      fromSchedule.rows = packTrips(fromSchedule.trips)

      // re-insert
      const trip = {
        ...options.trip,
        driver: options.team.driver,
        medic: options.team.medic,
      }
      toSchedule.trips.push(trip)
      toSchedule.rows = packTrips(toSchedule.trips)

      syncTrip(state.mode, trip)
    },

    updateTeams (state: TripsState, teams: Team[]) {
      // FIXME: add checks to ensure teams don't disappear
      // and are not duplicated
      state.teams = teams
      state.scheduleByTeam = teams.reduce(
        (acc, v) => {
          const key = tripKey(v)
          acc[key] = state.scheduleByTeam[key] || {
            trips: [],
            rows: [[]],
          }
          return acc
        },
        {} as ScheduleByTeam
      )
      if (!state.savesDisabled) {
        syncTeams(state.mode, state.teams)
      }
    },

    importJobs (state: TripsState, jobs: Job[]) {
      // Jobs can be one-way / two-way
      const trips = _.flatten(jobs.map(job => {
        const firstTrip = job.trip && {id: uniqueId(), ...job, ...job.trip}
        const secondTrip = job.secondTrip && {id: uniqueId(), ...job, ...job.secondTrip}

        if (firstTrip && secondTrip) return [firstTrip, secondTrip] as Trip[]
        else if (firstTrip || secondTrip) return [(firstTrip || secondTrip)] as Trip[]
        else return [] as Trip[]
      }))

      const teamByKey = _.mapValues(
        _.keyBy(
          trips,
          tripKey
        ) as {[k: string]: Trip},
        (trip: Trip) => ({ driver: trip.driver, medic: trip.medic, vehicle: null })
      )

      const tripsByKey = _.groupBy(
        trips,
        tripKey
      ) as {[k: string]: Trip[]}

      state.teams = _.values(teamByKey).map(s => ({...s, vehicle: null}))
      state.scheduleByTeam = _.fromPairs(
        state.teams.map(team => {
          const key = tripKey(team)
          return [
            key,
            {
              trips: tripsByKey[key],
              rows: packTrips(tripsByKey[key]),
            }
          ]
        })
      )
      // syncSchedules(date, state.scheduleByTeam)
      syncTeams(state.mode, state.teams)
      _.values(tripsByKey).forEach((trips: Trip[]) => {
        trips.forEach(trip => {
          syncTrip(state.mode, trip)
        })
      })
    },

    updateTrip (
      state: TripsState,
      options: {team: KeyableTrip, index: number, updates: {[key: string]: any}}
    ) {
      assert(!('driver' in options.updates))
      assert(!('medic' in options.updates))
      // FIXME: Type safety?
      const schedule = state.scheduleByTeam[tripKey(options.team)]
      const trip: any = schedule.trips[options.index]

      assert(trip)

      for (let key of Object.keys(options.updates)) {
        trip[key] = options.updates[key]
      }

      if ('startTime' in options.updates || 'endTime' in options.updates) {
        schedule.rows = packTrips(schedule.trips)
      }

      if (!state.savesDisabled) {
        // FIXME: This is bad form! -- async actions
        // on global state inside a synchronous fn
        syncTrip(state.mode, trip)
      }
    },

    deleteTrip(state: TripsState, options: {team: KeyableTrip, tripIndex: number}) {
      const schedule = state.scheduleByTeam[tripKey(options.team)]
      const trip = schedule.trips[options.tripIndex]
      schedule.trips.splice(options.tripIndex, 1)
      schedule.rows = packTrips(schedule.trips)
      syncDeleteTrip(state.mode, trip)
    },

    _setMode(state: TripsState, mode: AppMode) {
      state.mode = mode
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
    },

    _autoUpdateTrips(state: TripsState, options: AutoUpdateTrips) {
      if ('teams' in options) {
        state.autoUpdate.teams = options.teams
        state.autoUpdate.teamsKey = options.teamsKey
      } else if ('trips' in options) {
        state.autoUpdate.trips = options.trips
        state.autoUpdate.tripsKey = options.tripsKey
      } else {
        throw new Error('unexpected value for options')
      }
    }
  },

  actions: {
    setMode(context: any, mode: AppMode) {
      const state = context.state as TripsState
      const currentMode = state.mode

      if (currentMode.type === 'date' && mode.type === 'date') {
        if (currentMode.timestamp === mode.timestamp) {
          return
        }
      } else if (currentMode.type === 'template' && mode.type === 'template') {
        if (currentMode.template === mode.template) {
          return
        }
      }

      const teamsPromise = readTeams(mode)
      const tripsPromise = readTrips(mode)

      const promise = Promise.all([
        teamsPromise, tripsPromise
      ])
      .then(([initialTeams, trips]) => {
        if (promise == state.inFlightPromise) {
          context.dispatch('_setTripsAndTeams', {teams: initialTeams, trips, mode})
          pushModeToHistory(mode)
        }
      })

      context.commit('_disableSaves', promise)
    },

    // Updates the current trips and team, if both
    // are synced to the current mode
    autoUpdateTrips(context: any, options: AutoUpdateTrips) {
      context.commit('_autoUpdateTrips', options)

      const tripsRelPath = context.state.autoUpdate.tripsKey.replace(/^\/trips\//, '')
      const teamsRelPath = context.state.autoUpdate.teamsKey.replace(/^\/trips\//, '')

      if (
        tripsRelPath === teamsRelPath &&
        getRelPath(context.state.mode) === tripsRelPath
      ) {
        context.dispatch('_setTripsAndTeams', {
          trips: context.state.autoUpdate.trips,
          teams: context.state.autoUpdate.teams,
          mode: context.state.mode,
        })
      }
    },

    _setTripsAndTeams(context: any, options: {teams: Team[], trips: Trip[], mode: AppMode}) {
      const [teams, schedules] = generateSchedule(options.teams, options.trips)
      context.commit('updateTeams', teams)
      // context.commit('') // No trips to commit?
      context.commit('_setSchedules', schedules)
      context.commit('_setMode', options.mode)
      context.commit('_enableSaves')
    }
  }
}

export function getRelPath(mode: AppMode): string {
  if (mode.type === 'date') {
    return formatDate(new Date(mode.timestamp))
  } else {
    return mode.template
  }
}

export function formatDate(date: Date) {
  return dateformat(date, 'yyyy-mm-dd')
}

function syncTeams(mode: AppMode, teams: KeyableTrip[]) {
  db.ref(`/teams/${getRelPath(mode)}`)
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

export function deserializeArray(o: {[key: string]: any}): any[] {
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

export function readTeams(mode: AppMode): Promise<Team[]> {
  return db.ref(`/teams/${getRelPath(mode)}`)
  .once('value')
  .then((values: Firebase.database.DataSnapshot) => parseTeamsData(values))
}

export function parseTeamsData(v: firebase.database.DataSnapshot) {
  const values = v.val() || {}
  return deserializeArray(values)
    .map(teamRaw => ({
      driver: teamRaw.driver || null,
      medic: teamRaw.medic || null,
      vehicle: teamRaw.vehicle || null,
    }))
}

function generateSchedule(
  teams: Team[],
  trips: Trip[]
): [KeyableTrip[], ScheduleByTeam] {
  const teamByKey = _.mapValues(
    _.keyBy(
      teams.filter(t => t.driver || t.medic),
      tripKey
    ),
    team => ({ driver: team.driver, medic: team.medic })
  )
  const tripsByKey = _.groupBy(
    trips,
    tripKey
  ) as {[k: string]: Trip[]}

  // If there are trips with team not in teams,
  // add to teams
  const teamsToPrepend: Team[] = Object.keys(tripsByKey)
    .filter(key => !(key in teamByKey))
    .map(key => {
      const {driver, medic} = tripsByKey[key][0]
      return {driver, medic, vehicle: null}
    })

  const newTeams = teamsToPrepend.concat(teams)

  const schedule: {[k: string]: ScheduleData} = _.fromPairs(
    newTeams.map((team): [string, ScheduleData] => {
      const key = tripKey(team)
      const trips = tripsByKey[key] || []
      return [
        key,
        {
          trips: trips,
          rows: packTrips(trips),
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
 * pack them in such a way that there are no conflicts. Ensures
 * at least one row will be generated
 */
function packTrips(trips: Trip[]): number[][] {
  const arrayOfTrips: number[][] = []

  const last = <T>(t: T[]) => t[t.length - 1]

  const sortedTrips = _.sortBy(
    _.range(0, trips.length),
    (t: number) => trips[t].startTime
  )

  const conflictsWith = (a: Trip, b: Trip) => {
    return Math.min(imputedEndTime(a), imputedEndTime(b)) >
      Math.max(a.startTime, b.startTime)
  }

  sortedTrips.forEach((tripIndex) => {
    const nonConflicting = arrayOfTrips.find(tripIndices =>
      !conflictsWith(trips[tripIndex], trips[last(tripIndices)])
    )
    if (!nonConflicting) {
      arrayOfTrips.push([tripIndex])
    } else {
      nonConflicting.push(tripIndex)
    }
  })

  if (arrayOfTrips.length === 0) {
    arrayOfTrips.push([])
  }

  return arrayOfTrips
}

// TODO: We may want to partition by trips by date, and fetch them all
function syncTrip(mode: AppMode, trip: Trip) {
  trip.id = trip.id || uniqueId()
  db.ref(`/trips/${getRelPath(mode)}/${trip.id}`).set(trip)
}
function syncDeleteTrip(mode: AppMode, trip: Trip) {
  assert(trip.id, 'Wanted to delete a trip without an ID')
  db.ref(`/trips/${getRelPath(mode)}/${trip.id}`).set(null)
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

export function readTrips(mode: AppMode): Promise<Trip[]> {
  return db.ref(`/trips/${getRelPath(mode)}`)
  .once('value')
  .then(v => parseTripsData(v))
}

export function parseTripsData(v: firebase.database.DataSnapshot): Trip[] {
  const value = v.val() || {}
  return _.values(value)
    .map(tripRaw => ({
      driver: tripRaw.driver || null,
      medic: tripRaw.medic || null,
      startTime: isFinite(tripRaw.startTime)
        ? Math.max(0, Math.min(27 * 3600e3, parseInt(tripRaw.startTime)))
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
      startLocation: tripRaw.startLocation || null,
      endLocation: tripRaw.endLocation || null,
      startLatLng: parseLatLng(tripRaw.startLatLng),
      endLatLng: parseLatLng(tripRaw.endLatLng),
      isTentative: !!tripRaw.isTentative,
      relatedTrip: tripRaw.relatedTrip || null,
      isReturnTrip: !!tripRaw.isReturnTrip,
      type: tripRaw.type || '<No type>',
      price: isFinite(tripRaw.price)
        ? parseInt(tripRaw.price)
        : null,
      cancelled: tripRaw.cancelled || false,
      created: tripRaw.created || Date.now(),
      templateTrip: tripRaw.templateTrip || null,
    }))
}

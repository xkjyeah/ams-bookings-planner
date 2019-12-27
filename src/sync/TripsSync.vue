<template>

</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import {VehicleStatus, Person, PersonList} from '@/store/vehicles'
import {db} from '@/lib/firebase'
import store from '@/store'
import {AppMode, getRelPath, parseTripsData, parseTeamsData, AutoUpdateTrips} from '@/store/trips'

export default Vue.extend({
  computed: {
    mode (): AppMode {
      return this.$store.state.trips.mode as AppMode
    },

    relPath (): string {
      return getRelPath(this.mode)
    }
  },

  created () {
    const $tripsCallback = (e: firebase.database.DataSnapshot | null) => {
      if (!e) return

      this.autoUpdateTrips({
        trips: parseTripsData(e),
        tripsKey: e.key || '',
      })
    }

    const $teamsCallback = (e: firebase.database.DataSnapshot | null) => {
      if (!e) return

      this.autoUpdateTrips({
        teams: parseTeamsData(e),
        teamsKey: e.key || '',
      })
    }

    this.$watch('relPath', (newValue, oldValue) => {
      // Turn off the previous callback
      if (oldValue && newValue !== oldValue) {
        db.ref(`/trips/${oldValue}`).off('value', $tripsCallback)
        db.ref(`/teams/${oldValue}`).off('value', $teamsCallback)
      }
      db.ref(`/trips/${newValue}`).on('value', $tripsCallback)
      db.ref(`/teams/${newValue}`).on('value', $teamsCallback)
    }, {immediate: true})
  },

  methods: {
    autoUpdateTrips(opts: AutoUpdateTrips) {
      this.$store.dispatch('trips/autoUpdateTrips', opts)
    },
  }
})
</script>

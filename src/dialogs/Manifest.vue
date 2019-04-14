<template>
  <StandardDialog name="manifest" title="Trip manifest">
    <table class="manifest-table">
      <thead>
        <tr>
          <th>Team</th>
          <th>Start</th>
          <th>End</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trip in trips" :key="trip.id"
            :class="{cancelled: trip.cancelled}">
          <td>{{trip.driver}}, {{trip.medic}}</td>
          <td>{{dateformat(trip.startTime, 'HH:MM', true)}}</td>
          <td>{{trip.endTime && dateformat(trip.endTime, 'HH:MM', true)}}</td>
          <td>
            <div>{{trip.description}}</div>
            <div v-if="trip.startAddress || trip.startLocation">
              <b>From: </b>{{trip.startAddress}} {{trip.startLocation}}</div>
            <div v-if="trip.endAddress || trip.endLocation">
              <b>To: </b>{{trip.endAddress}} {{trip.endLocation}}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </StandardDialog>
</template>
<style scoped lang="scss">
table.manifest-table {
  border-collapse: collapse;
  border: solid 1px black;
  width: 100%;

  td, th {
    border: dotted 1px #888;
  }

  td {
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #EEE;
  }

  tr.cancelled td {
    text-decoration: line-through;
  }

}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {Team, KeyableTrip, Trip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey, ProcessedScheduleData, deserializeArray, readTeams} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import StandardDialog from '@/dialogs/StandardDialog.vue';
import assert from 'assert';
import dateformat from 'dateformat';
import { db } from '@/lib/firebase';
import _ from 'lodash';

export default Vue.extend({
  data () {
    return {
      selectedDate: null as null | string,
      preview: null as Team[] | null,
    }
  },

  components: {
    StandardDialog
  },

  computed: {
    dialogShown () {
      return (store.state as any).dialogs.activeDialog == 'manifest'
    },

    dateformat: () => dateformat,

    trips (): Trip[] {
      const unsortedTrips = _.flatMap(
        this.$store.getters['trips/teamSchedules'],
        (arr: [Team, ProcessedScheduleData]) => {
          return arr[1].trips
        }
      )
      return _.sortBy(
        unsortedTrips,
        (t: Trip) => t.startTime
      )
    }
  },

  methods: {
    handleDialogInput () {
      this.$store.commit('dialogs/hideDialog')
    },
  }
})
</script>


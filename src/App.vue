<template>
  <v-app class="app">
    <v-layout class="controls" row
        align-content-start
    >
      <DatePicker style="flex: 0 0 100px" />
      <v-radio-group
        row
        v-model="xAxisScale">
        <v-radio
          label="Small"
          :value="100"
          />
        <v-radio
          label="Medium"
          :value="200"
          />
        <v-radio
          label="Large"
          :value="400"
          />
      </v-radio-group>
      <v-btn @click="showTeamsDialog">
        Manage teams
      </v-btn>
      <v-btn @click="importJobs">
        Import jobs
      </v-btn>
    </v-layout>
    <TripEditor class="trip-editor-window" />
    <ChartArea
      class="chart-area"
      ref="chart-area"
      :xAxisScale="xAxisScale"
      :yAxisScale="yAxisScale"
      @trip-clicked="$store.commit('tripEditing/editTrip', $event)"
      />
    <TimeUpdater />
    <VehiclesSync />
    <TeamsDialog />
  </v-app>
</template>

<style lang="scss">
.planner-chart {
  position: relative;
}
</style>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;

  .controls {
    flex: 0 0 auto;
  }
  .chart-area {
    flex: 1 1 auto;
  }

  .trip-editor-window {
    position: fixed;
    right: 1em;
    top: 1em;
    bottom: 1em;
    width: 33vw;
    padding: 0.5em;
    overflow: auto;
    background: white;
    box-shadow: 0.5em 0.5em 1em rgba(0,0,0,0.5);
    z-index: 999;
    box-sizing: border-box;
  }
}
</style>


<script lang="ts">
import _ from 'lodash';
import querystring from 'querystring';
import Vue from 'vue';
import {JobTrip, KeyableTrip} from '@/lib/types.ts';
import {TripsState} from '@/store/trips.ts';
import ChartArea from '@/components/chart/ChartArea.vue';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import TripEditor from '@/components/TripEditor.vue';
import DatePicker from '@/components/DatePicker.vue';
import TeamsDialog from '@/dialogs/Teams.vue';
import VehiclesSync from '@/sync/VehiclesSync.vue';
import store from '@/store';
import defaultData from '@/assets/default-data';

export default Vue.extend({
  name: 'app',
  data () {
    return {
      xAxisScale: 100,
      yAxisScale: 25,
    }
  },
  computed: {
    _: () => _,

    chartAreaWidth () {
      return 24 * this.xAxisScale
    },

    chartAreaHeight () {
      return ((store.state as any).trips as TripsState)
        .teams.length * this.yAxisScale
    },

    trips (): Array<JobTrip> {
      return store.getters['trips/trips']
    },

    teamSchedules () {
      return (store.getters as any)['trips/teamSchedules']
    },
  },
  components: {
    ChartArea,
    DatePicker,
    TimeUpdater,
    TeamList,
    TeamsDialog,
    TripEditor,
    VehiclesSync,
  },
  created () {
    try {
      const dateHash = () => {
        const hash = querystring.parse(window.location.hash.substring(1))
        if (hash.date) {
          const date = new Date(hash.date)
          return isFinite(date.getTime()) ? date : null
        }
      }

      const handleNewDateHash = () => {
        const d = dateHash()

        if (d) {
          store.dispatch('trips/setDate', d)
          return true
        }
        return false
      }

      window.addEventListener('popstate', handleNewDateHash)

      if (handleNewDateHash()) {
        return
      }
    } catch {}
    store.dispatch('trips/setDate', new Date)
  },
  mounted () {
    (this.$refs['chart-area'] as any).scrollToCurrentTime()
  },
  methods: {
    showTeamsDialog () {
      store.commit('dialogs/showDialog', 'teams')
    },
    importJobs () {
      // initialize data
      store.commit('trips/importJobs', defaultData())
    }
  }
});
</script>

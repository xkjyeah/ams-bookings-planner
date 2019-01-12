<template>
  <v-app class="app">
    <div class="controls">
      <v-radio-group
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
    </div>
    <div class="trip-editor-window">
      <TripEditor />
    </div>
    <ChartArea
      class="chart-area"
      ref="chart-area"
      :xAxisScale="xAxisScale"
      :yAxisScale="yAxisScale"
      @trip-clicked="$store.commit('tripEditing/editTrip', $event)"
      />
    <TimeUpdater />
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
    overflow: auto;
    background: white;
    box-shadow: 0.5em 0.5em 1em rgba(0,0,0,0.5);
    z-index: 999;
  }
}
</style>


<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import {JobTrip, KeyableTrip} from '@/lib/types.ts';
import {TripsState} from '@/store/trips.ts';
import ChartArea from '@/components/chart/ChartArea.vue';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import TripEditor from '@/components/TripEditor.vue';
import store from '@/store';

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
    TimeUpdater,
    TeamList,
    TripEditor,
  },
  mounted () {
    (this.$refs['chart-area'] as any).scrollToCurrentTime()
  },
  methods: {
  }
});
</script>

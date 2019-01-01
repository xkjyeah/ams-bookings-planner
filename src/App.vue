<template>
  <div>
    <PlannerChart class="planner-chart"
      :xAxisScale="xAxisScale"
      :yAxisScale="yAxisScale">
      <template slot="background-svg" slot-scope="s">
        <svg :width="chartAreaWidth + s.yAxisWidth"
          :height="chartAreaHeight + s.xAxisHeight">
          <!-- <g :transform="`translate(${s.yAxisWidth} ${s.xAxisHeight})`"> -->
            <HorizontalGridLines
              :rowHeight="yAxisScale"
              :n="teamSchedules.length + 1"
              :width="chartAreaWidth"
            />
            <VerticalGridLines
              :columnWidth="xAxisScale"
              :n="24"
              :height="chartAreaHeight"
            />
            <CurrentTime
              :columnWidth="xAxisScale"
              :height="chartAreaHeight"
            />
          <!-- </g> -->
        </svg>
      </template>

      <template slot="x-axis" slot-scope="s">
        <div v-for="i in _.range(0, 24)"
          :key="i"
          :style="{
            left: (s.scale * i) + 'px',
            bottom: '0',
            position: 'absolute',
          }">
          &#x00a0;{{i}}:00
        </div>
      </template>

      <template slot="y-axis" slot-scope="s">
        <div v-for="(team_data, i) in teamSchedules"
          :key="i"
          :style="{
            'text-align': 'right',
            left: '0',
            right: '0',
            height: (s.scale) + 'px',
            top: (s.scale * i) + 'px',
            position: 'absolute',
          }">
          {{team_data[0].driver}}, {{team_data[0].medic}}
        </div>
      </template>

      <template slot-scope="s">
        <template v-for="([team, data], i) in teamSchedules">
          <Trip v-for="(trip, j) in data.trips"
            :key="trip.id"
            :trip="trip"
            :yIndexFunction="t => i"
            />
        </template>
      </template>
    </PlannerChart>
  </div>
</template>

<style lang="scss">
.planner-chart {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
}
</style>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import {JobTrip, KeyableTrip} from '@/lib/types.ts';
import {TripsState} from '@/store/trips.ts';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import PlannerChart from '@/components/PlannerChart.vue';
import HorizontalGridLines from '@/components/HorizontalGridLines.vue';
import VerticalGridLines from '@/components/VerticalGridLines.vue';
import CurrentTime from '@/components/CurrentTime.vue';
import Trip from '@/components/Trip.vue';
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
    CurrentTime,
    HorizontalGridLines,
    PlannerChart,
    TimeUpdater,
    Trip,
    VerticalGridLines
  },
});
</script>

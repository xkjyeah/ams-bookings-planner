<template>
  <PlannerChart class="planner-chart"
    :xAxisScale="xAxisScale"
    :yAxisScale="yAxisScale"
    >
    <template slot="background-svg" slot-scope="s">
      <svg :width="0.5 * screenWidth + chartAreaWidth + s.yAxisWidth"
        :height="chartAreaHeight + s.xAxisHeight">
        <!-- <g :transform="`translate(${s.yAxisWidth} ${s.xAxisHeight})`"> -->
          <HorizontalGridLines
            :rowHeight="yAxisScale"
            :n="teamSchedules.length"
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
      <TeamList
        :teamSchedules="teamSchedules"
        :scale="s.scale"
        />
    </template>

    <template slot-scope="s">
      <template v-for="([team, data], i) in teamSchedules">
        <TripBar v-for="(trip, j) in data.trips"
          :isSelected="tripKey(team) === tripKey($store.state.tripEditing.teamBeingEdited) && j === $store.state.tripEditing.tripIndexBeingEdited"
          :key="trip.id"
          :trip="trip"
          :yIndexFunction="t => i"
          @click="tripClicked(trip, j)"

          v-draggable
          @dragstart.native="onDragStart($event, trip, j)"
          />
      </template>
    </template>
  </PlannerChart>
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import {JobTrip, KeyableTrip, Trip} from '@/lib/types.ts';
import {TripsState, tripKey} from '@/store/trips.ts';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import PlannerChart from '@/components/chart/PlannerChart.vue';
import HorizontalGridLines from '@/components/chart/HorizontalGridLines.vue';
import VerticalGridLines from '@/components/chart/VerticalGridLines.vue';
import CurrentTime from '@/components/chart/CurrentTime.vue';
import TripBar from '@/components/chart/TripBar.vue';
import store from '@/store';

export default Vue.extend({
  name: 'app',
  props: {
    xAxisScale: { type: Number },
    yAxisScale: { type: Number },
  },
  computed: {
    _: () => _,

    tripKey: () => tripKey,

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

    screenWidth () {
      return (store.state.screen.width)
    }
  },
  components: {
    CurrentTime,
    HorizontalGridLines,
    PlannerChart,
    TimeUpdater,
    TeamList,
    TripBar,
    VerticalGridLines
  },
  watch: {
    'xAxisScale' () {
      // FIXME: observe the previous position first?
      this.$nextTick(() => {
        this.scrollToCurrentTime()
      })
    }
  },
  methods: {
    // Ensure that "now" is at ~33% of the page
    scrollToCurrentTime () {
      const currentTime = this.$store.state.time.time
      const midnight = new Date(currentTime)
      midnight.setHours(0, 0, 0, 0)
      const timeOffset = new Date(currentTime).getTime() - midnight.getTime()

      const myWidth = this.$el.clientWidth
      const timePosition = timeOffset / 3600e3 * this.xAxisScale

      const scrollPosition = timePosition - 0.33 * myWidth

      this.$el.scrollLeft = scrollPosition
    },

    tripClicked (trip: Trip, index: number) {
      this.$emit('trip-clicked', {team: trip, index})
    },

    onDragStart(event: DragEvent, trip: Trip, tripIndex: number) {
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          start: trip.startTime,
          end: trip.endTime || ((trip.startTime || 0) + 30 * 60e3),
          key: tripKey(trip),
          tripIndex,
        }))
    },

  }
});
</script>

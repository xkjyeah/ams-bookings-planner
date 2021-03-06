<template>
  <PlannerChart class="planner-chart"
    :xAxisScale="xAxisScale"
    :yAxisScale="yAxisScale"
    @scroll.native="onScroll"
    >
    <template slot="background-svg" slot-scope="s">
      <svg :width="0.5 * screenWidth + chartAreaWidth + s.yAxisWidth"
        :height="chartAreaHeight + s.xAxisHeight"
        @dblclick="createNewTrip"
      >
        <!-- <g :transform="`translate(${s.yAxisWidth} ${s.xAxisHeight})`"> -->
          <HorizontalGridLines
            :rowHeight="yAxisScale"
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
          width: xAxisScale + 'px',
        }"
        style="cursor: pointer;"
        @click="scrollToTime(i * 3600e3)">
        &#x00a0;{{i}}:00
      </div>
    </template>

    <template slot="y-axis" slot-scope="s">
      <TeamList
        :teamSchedules="teamSchedules"
        :scale="s.scale"
        />
    </template>

    <template>
      <!-- {{teamSchedules}} -->
      <template v-for="([team, data], i) in teamSchedules">
        <TripBar v-for="(trip, j) in data.trips"
          :isSelected="trip.id === $store.state.tripEditing.tripBeingEdited"
          :key="trip.id"
          :trip="trip"
          :yIndexFunction="t => i"
          @click="tripClicked(trip)"

          v-draggable
          @dragstart.native="onDragStart($event, trip, i)"
          @dragend.native="onDragEnd()"
          />
      </template>
      <template v-for="([team, data], i) in teamSchedules">
        <VehicleMarker v-if="team.vehicle && data.row === 0"
          :key="i"
          :vehicle="team.vehicle"
          :rowCount="data.rowCount"
          :yIndex="i"
        />
      </template>
    </template>
  </PlannerChart>
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import {KeyableTrip, Trip, imputedEndTime} from '@/lib/types.ts';
import {TripsState, tripKey} from '@/store/trips.ts';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import PlannerChart from '@/components/chart/PlannerChart.vue';
import HorizontalGridLines from '@/components/chart/HorizontalGridLines.vue';
import VerticalGridLines from '@/components/chart/VerticalGridLines.vue';
import CurrentTime from '@/components/chart/CurrentTime.vue';
import TripBar from '@/components/chart/TripBar.vue';
import VehicleMarker from '@/components/chart/VehicleMarker.vue';
import store from '@/store';
import {ScreenState} from '@/store/screen';
import scrollHelper from '@/lib/scrollHelper'
import * as tripReassignment from './tripReassignment'

const VISUAL_CENTER = 0.33

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
      return this.$store.getters['trips/rowCount'] * this.yAxisScale
    },

    trips (): Trip[] {
      return this.$store.getters['trips/trips']
    },

    teamSchedules () {
      return (this.$store.getters as any)['trips/teamSchedules']
    },

    screenWidth () {
      return (this.$store.state.screen as ScreenState).width
    }
  },
  components: {
    CurrentTime,
    HorizontalGridLines,
    PlannerChart,
    TimeUpdater,
    TeamList,
    TripBar,
    VehicleMarker,
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
  created () {
    scrollHelper.$on('scrollToTime', (time: number) => {this.scrollToTime(time)})
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

      const scrollPosition = timePosition - VISUAL_CENTER * myWidth

      this.$el.scrollLeft = scrollPosition
    },

    scrollToTime (time: number) {
      const myWidth = this.$el.clientWidth
      const timePosition = time / 3600e3 * this.xAxisScale

      const scrollPosition = timePosition - VISUAL_CENTER * myWidth

      const scrollABit = (n: number) => {
        if (n == 10) return
        const diff = scrollPosition - this.$el.scrollLeft

        this.$el.scrollLeft = this.$el.scrollLeft + diff * 0.3
        setTimeout(() => scrollABit(n + 1), 10)
      }
      scrollABit(0)
      // this.$el.scrollLeft = scrollPosition
    },

    tripClicked (trip: Trip, index: number) {
      this.$emit('trip-clicked', {tripId: trip.id})
    },

    onDragStart(event: DragEvent, trip: Trip, row: number) {
      tripReassignment.setData({
        start: trip.startTime,
        end: imputedEndTime(trip),
        tripId: trip.id,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        originalRow: row,
      })
      // Firefox insists on this to activate the drag
      event.dataTransfer!.setData('text/team-reorder-drag', 'dummy')
    },

    onDragEnd() {
      tripReassignment.setData(null)
    },

    createNewTrip (event: MouseEvent) {
      event.preventDefault()

      const alignedStartTime = Math.floor(
        event.offsetX / this.xAxisScale / 0.25
      ) * .25 * 3600e3
      const rowNumber = Math.floor(event.offsetY / this.yAxisScale)
      const team = this.$store.getters['trips/teamForRow'](rowNumber)

      if (team === null) return
      if (alignedStartTime > 23.75 * 3600e3) return

      this.$store.dispatch('tripEditing/createAndEditNewTripAtTime', {
        time: alignedStartTime,
        ...team,
      })
    },

    onScroll(event: Event) {
      this.$store.commit('screen/setScrollTime',
        (this.$el.scrollLeft + VISUAL_CENTER * this.$el.clientWidth)
          / this.xAxisScale
          * 3600e3
      )
    },
  }
});

</script>

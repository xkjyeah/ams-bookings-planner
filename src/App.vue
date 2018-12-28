<template>
  <div>
    <PlannerChart class="planner-chart" :xAxisScale="xAxisScale" :yAxisScale="yAxisScale">
      <template slot="background-svg" slot-scope="s">
        <svg :width="chartAreaWidth + s.yAxisWidth"
          :height="chartAreaHeight + s.xAxisHeight">
          <!-- <g :transform="`translate(${s.yAxisWidth} ${s.xAxisHeight})`"> -->
            <HorizontalGridLines
              :rowHeight="yAxisScale"
              :n="teams.length + 1"
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
        <div v-for="i in _.range(0, 24)" :key="i"
          :style="{
            left: (s.scale * i) + 'px',
            bottom: '0',
            position: 'absolute',
          }">
          &#x00a0;{{i}}:00
        </div>
      </template>

      <template slot="y-axis" slot-scope="s">
        <div v-for="(team, i) in teams" :key="team"
          :style="{
            'text-align': 'right',
            left: '0',
            right: '0',
            height: (s.scale) + 'px',
            top: (s.scale * i) + 'px',
            position: 'absolute',
          }">
          {{team}}
        </div>
      </template>

      <template slot-scope="s">
        <div v-for="(trip, i) in trips" :key="i"
          class="trip-box"
          :style="{
            left: (trip.startTime / 3600e3 * s.xScale) + 'px',
            width: (presumedDuration(trip) / 3600e3 * s.xScale) + 'px',
            height: (s.yScale) + 'px',
            top: (teamIndexByKey[tripKey(trip)] * s.yScale) + 'px',
            position: 'absolute',
            overflow: 'hidden',
            opacity: trip.cancelled ? 0.5 : 1.0,
          }">
          {{trip.description}}
        </div>
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

  .trip-box {
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 2;
    border: solid 1px #404;
    background-color: #808;
    color: #FFF;
    box-sizing: border-box;
  }
}
</style>


<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import DefaultData from '@/assets/default-data.ts';
import {JobTrip} from '@/assets/default-data.ts';
import PlannerChart from '@/components/PlannerChart.vue';
import HorizontalGridLines from '@/components/HorizontalGridLines.vue';
import VerticalGridLines from '@/components/VerticalGridLines.vue';
import CurrentTime from '@/components/CurrentTime.vue';

interface KeyableTrip {
  driver: string | null,
  medic: string | null
}

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

export default Vue.extend({
  name: 'app',
  data () {
    return {
      jobs: DefaultData(),
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
      return (this.teams.length + 1) * this.yAxisScale
    },

    trips (): Array<JobTrip> {
      return _.flatten(this.jobs.map(job => {
        const firstTrip = job.trip && {...job, ...job.trip}
        const secondTrip = job.secondTrip && {...job, ...job.secondTrip}

        if (firstTrip && secondTrip) return [firstTrip, secondTrip]
        else if (firstTrip || secondTrip) return [(firstTrip || secondTrip)]
        else return []
      }))
    },

    teamsByKey () {
      return _.keyBy(this.trips, this.tripKey)
    },

    teamIndexByKey () {
      const p = _.fromPairs(
        this.teams.map((t, i) => ['x' + t, i])
      )
      p['x'] = this.teams.length
      return p
    },

    teams () {
      const teams = _.flatten(this.trips.map(trip => {
        const team1Key = makeTripTeamKey(trip)
        return team1Key ? [team1Key] : []
      }))

      return _.uniq(teams)
    }
  },
  components: {
    CurrentTime,
    HorizontalGridLines,
    PlannerChart,
    VerticalGridLines
  },
  watch: {
    'teamsByKey': {
      immediate: true,
      handler () {
        console.log(Object.keys(this.teamsByKey))
      }
    }
  },
  methods: {
    tripKey (trip: KeyableTrip) {
      const key = makeTripTeamKey(trip)
        return 'x' + (key || '')
    },

    presumedDuration (trip: JobTrip) {
      return (trip.endTime !== null && trip.startTime !== null)
        ? (trip.endTime - trip.startTime)
        : 30 * 60e3
    }
  }
});
</script>

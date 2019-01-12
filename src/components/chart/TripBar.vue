<template>
  <v-tooltip
    v-bind="{
      [yIndexFunction(trip) === 0 ? 'bottom' : 'top']: true
    }"
    class="trip-box"
    :style="{
      left: (trip.startTime / 3600e3 * xScale()) + 'px',
      width: (presumedDuration(trip) / 3600e3 * xScale()) + 'px',
      height: (yScale()) + 'px',
      top: (yIndexFunction(trip) * yScale()) + 'px',
      opacity: trip.cancelled ? 0.5 : 1.0,
    }"
    @click.native="$emit('click', $event)"
    >
    <div
      slot="activator">
      {{trip.description}}
    </div>
    <span>
      <!-- tooltip -->
      {{trip.description}}
    </span>
  </v-tooltip>
</template>

<style lang="scss" scoped>
.trip-box {
  position: absolute;
  overflow: hidden;
  font-family: Arial, sans-serif;
  font-size: 14px;
  z-index: 2;
  border: solid 1px #404;
  background-color: #808;
  color: #FFF;
  box-sizing: border-box;
}
</style>

<script lang="ts">
import Vue from 'vue'
import {JobTrip} from '@/lib/types.ts';

export default Vue.extend({
  inject: {
    yScale: {},
    xScale: {},
  },
  props: {
    trip: {
      type: Object,
      required: true,
    },
    yIndexFunction: {
      type: Function,
      required: true,
    }
  },

  methods: {
    presumedDuration (trip: JobTrip) {
      return (trip.endTime !== null && trip.startTime !== null)
        ? (trip.endTime - trip.startTime)
        : 30 * 60e3
    }
  }
})
</script>

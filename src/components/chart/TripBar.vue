<template>
  <v-tooltip
    v-bind="{
      [yIndexFunction(trip) === 0 ? 'bottom' : 'top']: true
    }"
    class="trip-box"
    :class="{
      'is-selected': isSelected,
      'cancelled': trip.cancelled,
    }"
    :style="{
      left: (trip.startTime / 3600e3 * xScale()) + 'px',
      width: (presumedDuration(trip) / 3600e3 * xScale()) + 'px',
      height: (yScale()) + 'px',
      top: (yIndexFunction(trip) * yScale()) + 'px',
      opacity: trip.cancelled ? 0.5 : 1.0,
      'background': locationGradient,
      color: trip.latLng ? '#FFF' : '#000',
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
  color: #FFF;
  box-sizing: content-box;
}
.is-selected {
  border: solid 3px black;
}
.cancelled {
  text-decoration: line-through;
}
</style>

<script lang="ts">
import Vue from 'vue'
import {JobTrip} from '@/lib/types.ts';
import singaporeColors from '@/lib/singaporeColors';

export default Vue.extend({
  inject: {
    yScale: {},
    xScale: {},
  },
  props: {
    isSelected: {
      type: Boolean,
    },
    trip: {
      type: Object,
      required: true,
    },
    yIndexFunction: {
      type: Function,
      required: true,
    }
  },

  computed: {
    singaporeColors: () => singaporeColors,

    locationGradient () {
      if (this.trip.startLatLng && this.trip.endLatLng) {
        return `linear-gradient(
          90deg,
            ${this.singaporeColors(this.trip.startLatLng)} 20%,
            ${this.singaporeColors(this.trip.endLatLng)} 80%
          )`
      } else if (this.trip.startLatLng) {
        return this.singaporeColors(this.trip.startLatLng)
      } else if (this.trip.endLatLng) {
        return this.singaporeColors(this.trip.endLatLng)
      } else {
        return '#CCC'
      }
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

<template>
  <VehicleTooltip
    v-if="vehicleData"
    :value="vehicleData"
    v-bind="{
      [yIndex === 0 ? 'bottom' : 'top']: true
    }"
    >
    <div
      class="vehicle-marker"
      :class="{
        stale: isStale
      }"
      :style="{
        left: leftPosition,
        top: topPosition,
        height: height,
        'background-color': locationGradient,
        'border-radius': '1em'
      }">
      &nbsp;
    </div>
  </VehicleTooltip>
</template>

<style lang="scss" scoped>
.vehicle-marker {
  width: 1em;
  position: absolute;
  overflow: hidden;
  font-family: Arial, sans-serif;
  font-size: 14px;
  z-index: 2;
  border: solid 1px #404;
  color: #FFF;
  box-sizing: content-box;

  &.stale {
    opacity: 0.5;
  }
}
</style>

<script lang="ts">
import Vue from 'vue'
import VehicleTooltip from '@/components/common/VehicleTooltip.vue'
import {Trip, imputedEndTime} from '@/lib/types.ts';
import singaporeColors from '@/lib/singaporeColors';
import store from '@/store';
import sAgo from 's-ago';
import { vehicleStatusIsStale } from '@/store/vehicles';

export default Vue.extend({
  inject: {
    yScale: {},
    xScale: {},
  },
  props: {
    vehicle: {
      type: String,
      required: true,
    },
    rowCount: {
      type: Number,
      required: true,
    },
    yIndex: {
      type: Number,
      required: true,
    }
  },

  components: {
    VehicleTooltip,
  },

  computed: {
    singaporeColors: () => singaporeColors,

    vehicleData () {
      return store.getters['vehicles/vehiclesById'][this.vehicle]
    },

    timeSinceMidnight () {
      if (!this.vehicleData) return
      const created = new Date(this.vehicleData.created)
      return created.getHours() * 3600e3 + created.getMinutes() * 60e3 +
        created.getSeconds() * 1e3
    },

    locationGradient () {
      return this.vehicleData && this.singaporeColors({
        lat: this.vehicleData.lat,
        lng: this.vehicleData.lng,
      })
    },

    isStale () {
      if (!this.vehicleData) return
      return vehicleStatusIsStale(this.vehicleData)
    },

    leftPosition (): string {
      const currentTimeOffset = this.$store.getters['time/msSinceMidnight']
      const boundedTime = Math.min(
        currentTimeOffset + 3600e3,
        Math.max(
          currentTimeOffset - 3600e3,
          this.timeSinceMidnight || 0
        )
      )
      const centreX = (boundedTime / 3600e3 * this.xScale()) + 'px'
      return `calc(${centreX} - 0.75em)`
    },

    topPosition (): string {
      const centreY = (this.yIndex * this.yScale()) + 'px'
      return `calc(${centreY} + 0.25em)`
    },

    height (): string {
      const rowHeight = (this.rowCount * this.yScale()) + 'px'
      return `calc(${rowHeight} - 0.5em)`
    },

    sAgo: () => (d: any) => sAgo(new Date(d)),
  },

  methods: {
    presumedDuration (trip: Trip) {
      return imputedEndTime(trip) - trip.startTime
    }
  }
})
</script>

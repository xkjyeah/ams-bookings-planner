<template>
  <UnobstrusiveTooltip
    :top="true"
    class="trip-box"
    :class="{
      'is-selected': isSelected,
      'is-tentative': trip.isTentative,
      'cancelled': trip.cancelled,
      'hidden-from-manifest': trip.hideFromManifest,
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
      slot="activator"
      >
      {{trip.description}}
    </div>
    <span>
      <!-- tooltip -->
      {{trip.description}}
    </span>
  </UnobstrusiveTooltip>
</template>

<style lang="scss" scoped>
.trip-box {
  user-select: none;
  position: absolute;
  overflow: hidden;
  font-family: Arial, sans-serif;
  font-size: 13px;
  z-index: 2;
  border: solid 1px #404;
  color: #FFF;
  box-sizing: content-box;
  white-space: nowrap;

  &:hover:not(.is-selected) {
    box-shadow: 0px 0px 4px rgba(0, 0, 153, 0.5);
  }
  &.is-tentative {
    border: dashed 1px #404;
  }
  &.is-selected {
    box-shadow: 0px 0px 4px #009;
  }
  &.hidden-from-manifest {
    border: solid 1.5px #F00;
  }
  &.cancelled {
    text-decoration: line-through;
  }
}
</style>

<script lang="ts">
import Vue from 'vue'
import {Trip, imputedEndTime} from '@/lib/types.ts';
import UnobstrusiveTooltip from '@/components/common/UnobstrusiveTooltip.vue';
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

  components: {
    UnobstrusiveTooltip
  },

  data () {
    return {
      tooltipNeeded: true,
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
    presumedDuration (trip: Trip) {
      return imputedEndTime(trip) - trip.startTime
    },
  }
})
</script>

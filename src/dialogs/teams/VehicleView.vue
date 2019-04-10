<template>
  <span v-if="value && vehiclesById[value]">
    <VehicleTooltip v-if="vehiclesById[value]" :value="vehiclesById[value]"
      bottom>
      {{value}}
      <span class="vehicle"
        :style="{
          'background-color': singaporeColors(vehiclesById[value])
        }"
        :class="{stale: stale(vehiclesById[value])}">
      </span>
    </VehicleTooltip>
  </span>
  <span v-else-if="value">
    {{value}}
  </span>
  <span v-else class="placeholder">
    {{placeholder}}
  </span>
</template>
<style lang="scss" scoped>
.vehicle {
  display: inline-block;
  vertical-align: middle;
  border: solid 1px black;
  height: 0.9em;
  width: 0.9em;
  border-radius: 3px;

  &.stale {
    opacity: 0.5;
  }
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VehiclesState, PersonList, VehicleStatus, vehicleStatusIsStale } from '@/store/vehicles';
import singaporeColors from '@/lib/singaporeColors'
import VehicleTooltip from '@/components/common/VehicleTooltip.vue'

export default Vue.extend({
  props: {
    value: {},
    placeholder: {type: String, default: ''},
  },
  computed: {
    vehiclesById(): {[k: string]: VehicleStatus} {
      return this.$store.getters['vehicles/vehiclesById']
    },
    singaporeColors: () => (v: VehicleStatus): string => {
      return singaporeColors(v)
    },
    stale: () => (v: VehicleStatus) => {
      return vehicleStatusIsStale(v)
    }
  },
  components: {
    VehicleTooltip,
  }
})
</script>


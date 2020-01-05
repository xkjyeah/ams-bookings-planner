<template>
  <VehicleTooltip v-if="vehiclesById[value]"
      :value="vehiclesById[value]"
      v-bind="$attrs">
    <slot name="before" />
    <span class="vehicle"
      :style="{
        'background-color': singaporeColors(vehiclesById[value])
      }"
      :class="{stale: stale(vehiclesById[value])}"
      v-if="vehiclesById[value]">
    </span>
    <slot name="after" />
  </VehicleTooltip>
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


<template>
  <span v-if="value && vehiclesById[value]">
    <VehicleLabel :value="value" bottom>
      <template slot="before">{{value}} </template>
    </VehicleLabel>
  </span>
  <span v-else-if="value">
    {{value}}
  </span>
  <span v-else class="placeholder">
    {{placeholder}}
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { VehiclesState, PersonList, VehicleStatus } from '@/store/vehicles';
import singaporeColors from '@/lib/singaporeColors'
import VehicleLabel from '@/dialogs/teams/VehicleLabel.vue'

export default Vue.extend({
  props: {
    value: {},
    placeholder: {type: String, default: ''},
  },
  computed: {
    vehiclesById(): {[k: string]: VehicleStatus} {
      return this.$store.getters['vehicles/vehiclesById']
    },
  },
  components: {
    VehicleLabel,
  }
})
</script>


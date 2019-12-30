<template>
  <span v-if="value">
    {{value}}
    <span class="telephone" v-if="persons[value.toLowerCase()]">
      {{persons[value.toLowerCase()].telephone}}
    </span>
  </span>
  <span v-else class="placeholder">
    {{placeholder}}
  </span>
</template>
<style lang="scss" scoped>
.telephone {
  display: inline-block;
  border: dashed 0.5px #888;
  color: #888;
  margin-left: 1em;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VehiclesState, PersonList } from '@/store/vehicles';
export default Vue.extend({
  props: {
    value: {},
    placeholder: {type: String, default: ''},
  },
  computed: {
    persons(): PersonList {
      return (this.$store.state.vehicles as VehiclesState).persons
    }
  }
})
</script>


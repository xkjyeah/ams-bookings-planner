<template>
  <v-select
    :items="teams"
    :item-text="t => (t.driver && t.medic) ? `${t.driver}, ${t.medic}` : '(Not assigned)'"
    :item-value="tripKey"
    :value="value"
    v-bind="$attrs"
    v-on="$listeners"
    />
</template>
<script lang="ts">
import Vue from 'vue'
import { tripKey } from '@/store/trips';
import { KeyableTrip } from '@/lib/types';
export default Vue.extend({
  props: ['value', 'withNull'],

  computed: {
    tripKey: () => tripKey,
    teams (): KeyableTrip[] {
      const emptyTripKey = tripKey({driver: null, medic: null})
      if (this.withNull && !(emptyTripKey in this.$store.state.trips.scheduleByTeam)) {
        return [{driver: null, medic: null}].concat(this.$store.state.trips.teams)
      }
      return this.$store.state.trips.teams
    }
  }
})
</script>


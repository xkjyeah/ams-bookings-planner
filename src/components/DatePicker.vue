<template>
  <v-menu v-model="isOpen" offset-y>
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="timestampText"
        label="Date:"
        readonly
        v-on="on"
        style="flex: 0 0 150px"
      />
    </template>
    <v-date-picker
      :value="timestampISO"
      @input="handleDateInput"
      />
  </v-menu>
</template>
<script lang="ts">
import dateformat from 'dateformat';
import store from '@/store';
import { TripsState } from '@/store/trips';
export default {
  data () {
    return {
      isOpen: false,
    }
  },
  computed: {
    timestampText () {
      const mode = (store.state.trips as TripsState).mode
      if (mode.type === 'date') {
        return dateformat(mode.timestamp, 'ddd, dd mmm yyyy')
      }
    },
    timestampISO () {
      const mode = (store.state.trips as TripsState).mode
      if (mode.type === 'date') {
        return dateformat(mode.timestamp, 'yyyy-mm-dd')
      }
    }
  },
  methods: {
    handleDateInput (d: string) {
      // FIXME: handle time zones properly?
      store.dispatch('trips/setMode', {
        type: 'date',
        timestamp: new Date(d + "T00:00:00+0800").getTime()
      })
    }
  }
}
</script>


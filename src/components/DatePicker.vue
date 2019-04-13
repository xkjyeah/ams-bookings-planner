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
<script>
import dateformat from 'dateformat';
import store from '@/store';
export default {
  data () {
    return {
      isOpen: false,
    }
  },
  computed: {
    timestampText () {
      console.log(new Date(store.state.trips.timestamp))
      return dateformat(store.state.trips.timestamp, 'ddd, dd mmm yyyy')
    },
    timestampISO () {
      return dateformat(store.state.trips.timestamp, 'yyyy-mm-dd')
    }
  },
  methods: {
    handleDateInput (d) {
      // FIXME: handle time zones properly?
      store.dispatch('trips/setDate', new Date(d + "T00:00:00+0800"))
    }
  }
}
</script>


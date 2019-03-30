<template>

</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import {VehicleStatus} from '@/store/vehicles'
import {db} from '@/lib/firebase'
import store from '@/store'

export default Vue.extend({
  mounted () {
    db.ref('/vehicles')
    .on('value', (e) => {
      if (!e) return

      const re = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/
      const parseDate = (s: string) => {
        const parts = s.match(re)
        if (!parts) return null
        return new Date(
          parseInt(parts[1]),
          parseInt(parts[2]) - 1,
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5]),
          parseInt(parts[6]),
        ).getTime()
      }

      const value = e.val()
      const vehicles = _.values(value)
        .map((v): VehicleStatus  => ({
          created: parseDate(v.created) || 0,
          direction: parseInt(v.direction),
          registrationNumber: v.registrationNumber as string,
          speed: parseInt(v.speed),
          lat: parseFloat(v.lat),
          lng: parseFloat(v.lng),
          location: v.location,
          vehicleStatus: v.vehicleStatus,
        }))

      store.commit('vehicles/setVehicles', _.sortBy(vehicles, 'registrationNumber'))
    })
  },
})
</script>

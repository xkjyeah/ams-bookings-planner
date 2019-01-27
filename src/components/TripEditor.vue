<template>
  <!-- FIXME: make this buffered? -->
  <div v-if="tripBeingEdited">
    <v-btn icon
      @click="$store.commit('tripEditing/editTrip', null)"
      ><v-icon>close</v-icon>
    </v-btn>
    <h2>
      {{tripBeingEdited.description}}
    </h2>

    <v-text-field
      label="Description"
      :value="tripBeingEdited.description"
      @input="updateTrip('description', $event)"
      />

    <DateEditor
      label="Date"
      :value="tripBeingEdited.date"
      @input="updateTrip('date', $event)"
      />

    <TimeEditor
      label="Start Time"
      :value="tripBeingEdited.startTime"
      @input="updateTrip('startTime', $event)"
      />

    <TimeEditor
      label="End Time"
      :value="tripBeingEdited.endTime"
      @input="updateTrip('endTime', $event < tripBeingEdited.startTime ? $event + 86400e3 : $event)"
      />

    <div :style="{'background-color': tripBeingEdited.latLng && singaporeColors(tripBeingEdited.latLng)}">
      <GmapAutocomplete
        @place_changed="updateLatLng"
        :options="{
          bounds: {north: 1.48, south: 1.2, east: 104.1, west: 102},
          strictBounds: true
        }"
        />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Trip } from '@/lib/types';
import {TripEditingState} from '@/store/tripEditing'
import TimeEditor from '@/components/common/TimeEditor.vue'
import DateEditor from '@/components/common/DateEditor.vue'
import singaporeColors from '@/lib/singaporeColors'
import {} from 'googlemaps'

export default Vue.extend({
  components: {
    TimeEditor,
    DateEditor,
  },

  computed: {
    tripBeingEdited (): Trip {
      return this.$store.getters['tripEditing/tripBeingEdited'] as Trip
    },

    singaporeColors: () => singaporeColors
  },

  methods: {
    updateTrip (field: string, value: any) {
      this.$store.dispatch('tripEditing/updateTripBeingEdited', {[field]: value})
    },

    combineDateTimeOffset(...args: any[]) {
      const [dateRef, timeRef, timeOffset] =
        (args.length === 2) ? [args[0], null, args[1]]
        : (args.length === 3) ? args
        : [-1, -1, -1]

      if (dateRef < 0) throw new Error('Bad args')

      const date = new Date(dateRef)
      let time = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      )
    },

    updateLatLng (e: google.maps.places.PlaceResult) {
      this.updateTrip('latLng', {lat: e.geometry.location.lat(), lng: e.geometry.location.lng()})
    }
  }
})
</script>

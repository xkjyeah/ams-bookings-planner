<template>
  <div v-if="tripBeingEdited" :key="tripBeingEdited.id" class="trip-editor">
    <v-card-text>
      <h2>
        {{tripBeingEdited.description}}
      </h2>

      <v-textarea
        label="Description"
        :value="tripBeingEdited.description"
        @input="updateTrip('description', $event)"
        rows="1"
        auto-grow
        :disabled="tripBeingEdited.cancelled"
        />

      <PostcodePicker
        label="Start Postcode"
        :value="tripBeingEdited.startPostcode"
        @input="updateTrip('startPostcode', $event)"
        @address-found="updateTrip('startLatLng', $event.latLng), updateTrip('startAddress', $event.address)"
        :disabled="tripBeingEdited.cancelled"
      />
      <div
        style="border-width: 2px; border-style: solid; flex: 1 1 auto"
        :style="{'border-color': tripBeingEdited.startLatLng && singaporeColors(tripBeingEdited.startLatLng)}">
        {{tripBeingEdited.startAddress}}
      </div>
      <v-text-field
        label="Start Location (Details)"
        :value="tripBeingEdited.startLocation"
        @input="updateTrip('startLocation', $event)"
        :disabled="tripBeingEdited.cancelled"
        />

      <PostcodePicker
        label="End Postcode"
        :value="tripBeingEdited.endPostcode"
        @input="updateTrip('endPostcode', $event)"
        @address-found="updateTrip('endLatLng', $event.latLng), updateTrip('endAddress', $event.address)"
        :disabled="tripBeingEdited.cancelled"
      />
      <div
        style="border-width: 2px; border-style: solid; flex: 1 1 auto"
        :style="{'border-color': tripBeingEdited.endLatLng && singaporeColors(tripBeingEdited.endLatLng)}">
        {{tripBeingEdited.endAddress}}
      </div>
      <v-text-field
        label="End Location (Details)"
        :value="tripBeingEdited.endLocation"
        @input="updateTrip('endLocation', $event)"
        :disabled="tripBeingEdited.cancelled"
        />

      <!-- <DateEditor
        label="Date"
        :value="tripBeingEdited.date"
        @input="updateTrip('date', $event)"
        :disabled="tripBeingEdited.cancelled"
        /> -->

      <TimeEditor
        label="Start Time"
        :value="tripBeingEdited.startTime"
        @input="updateTrip('startTime', $event)"
        :disabled="tripBeingEdited.cancelled"
        />

      <TimeEditor
        label="End Time"
        :value="tripBeingEdited.endTime"
        @input="updateTrip('endTime', $event < tripBeingEdited.startTime ? $event + 86400e3 : $event)"
        :disabled="tripBeingEdited.cancelled"
        />

      <PostcodePicker />
      <div style="text-align: right">
        <v-btn
          v-if="deleteAllowed"
          color="error"
          @click="$store.dispatch('tripEditing/deleteTrip')"
          >
          Delete
        </v-btn>
        <v-btn
          v-else
          color="error"
          @click="updateTrip('cancelled', !tripBeingEdited.cancelled)"
          >
          {{tripBeingEdited.cancelled ? 'Restore the trip' : 'Cancel the trip'}}
        </v-btn>
      </div>
    </v-card-text>
    <v-card-actions align="right">
      <v-btn
        color="neutral"
        @click="$store.commit('tripEditing/editTrip', null)"
        >Close
      </v-btn>
    </v-card-actions>
  </div>
</template>
<style scoped lang="scss">
.trip-editor {
  display: flex;
  flex-direction: column;

  .v-card__text {
    overflow: auto;
    flex: 1 1 auto;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import { Trip } from '@/lib/types';
import {TripEditingState} from '@/store/tripEditing'
import TimeEditor from '@/components/common/TimeEditor.vue'
import PostcodePicker from '@/components/common/PostcodePicker.vue'
import DateEditor from '@/components/common/DateEditor.vue'
import singaporeColors from '@/lib/singaporeColors'
import {} from 'googlemaps'

export default Vue.extend({
  components: {
    TimeEditor,
    DateEditor,
    PostcodePicker,
  },

  computed: {
    tripBeingEdited (): Trip {
      return this.$store.getters['tripEditing/tripBeingEdited'] as Trip
    },

    singaporeColors: () => singaporeColors,

    deleteAllowed (): Boolean {
      const now = this.$store.state.time.time
      return (now - this.tripBeingEdited.created) < 15 * 60e3
    }
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
  }
})
</script>

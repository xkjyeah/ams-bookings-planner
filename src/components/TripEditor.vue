<template>
  <div v-if="tripBeingEdited" :key="tripBeingEdited.id" class="trip-editor">
    <v-card-actions>
      <v-layout align-content-end>
        <v-spacer />
        <v-btn
          color="neutral"
          icon
          @click="$store.commit('tripEditing/editTrip', null)"
          >
          <v-icon>close</v-icon>
        </v-btn>
      </v-layout>
    </v-card-actions>
    <v-card-text>
      <h2>
        {{tripBeingEdited.description}}
      </h2>

      <v-select
        label="Assigned to"
        :items="$store.state.trips.teams"
        :item-text="t => `${t.driver}, ${t.medic}`"
        :item-value="tripKey"
        :value="tripKey(tripBeingEdited)"
        @input="reassignTripToTeam($event)"
        >
      </v-select>

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

      <v-layout>
        <div style="width: 80%">
          <TimeEditor
            label="Start Time"
            :value="tripBeingEdited.startTime"
            @input="updateTrip('startTime', $event)"
            :disabled="tripBeingEdited.cancelled"
            />

          <TimeEditor
            label="End Time"
            :value="tripBeingEdited.endTime"
            @input="updateTrip('endTime',
              $event === null ? null
              : $event < tripBeingEdited.startTime ? $event + 86400e3
              : $event)"
            :disabled="tripBeingEdited.cancelled"
            />
        </div>
        <div>
          <v-checkbox
            :input-value="tripBeingEdited.isTentative"
            @change="updateTrip('isTentative', $event)"
            label="Timing is tentative"
            />

          <a href="#" @click.prevent="visitRelatedTrip"
              v-if="tripBeingEdited.relatedTrip">
            {{tripBeingEdited.isReturnTrip
              ? 'First trip'
              : 'Return trip'}}
          </a>
        </div>
      </v-layout>
      <PostcodePicker />
      <v-layout>
        <v-spacer />
        <v-menu offset-y v-if="!tripBeingEdited.relatedTrip">
          <template v-slot:activator="{on}">
            <v-btn v-on="on">
              Return trip
            </v-btn>
          </template>
          <v-list>
            <v-list-tile @click="createReturnTrip(2 * 3600e3)">
              Return trip in 2hrs
            </v-list-tile>
            <v-list-tile @click="createReturnTrip(3 * 3600e3)">
              Return trip in 3hrs
            </v-list-tile>
            <v-list-tile @click="createReturnTrip(4 * 3600e3)">
              Return trip in 4hrs
            </v-list-tile>
            <v-list-tile @click="createReturnTrip(5 * 3600e3)">
              Return trip in 5hrs
            </v-list-tile>
          </v-list>
        </v-menu>
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
      </v-layout>
    </v-card-text>
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
import { Trip, Team } from '@/lib/types';
import {TripEditingState} from '@/store/tripEditing'
import TimeEditor from '@/components/common/TimeEditor.vue'
import PostcodePicker from '@/components/common/PostcodePicker.vue'
import DateEditor from '@/components/common/DateEditor.vue'
import singaporeColors from '@/lib/singaporeColors'
import {} from 'googlemaps'
import {tripKey, TripsState, ProcessedScheduleData} from '@/store/trips'
import uniqueId from '@/lib/uniqueId';

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

    tripKey: () => tripKey,

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

    reassignTripToTeam (key: string) {
      const team = this.$store.state.trips.teams.find((t: Team) =>
        tripKey(t) === key)

      this.$store.commit('trips/reassignJob', {
        trip: this.tripBeingEdited,
        team
      })
      this.$store.commit('tripEditing/editTrip', {
        team,
        index: (this.$store.state.trips as TripsState)
          .scheduleByTeam[tripKey(team)]
          .trips.length - 1
      })

      // TODO: scroll to the trip
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

    createReturnTrip(offset: number) {
      const relatedTripId = uniqueId()
      const trip: Trip = {
        ...this.tripBeingEdited,
        id: relatedTripId,

        description: '[Ret] ' + (this.tripBeingEdited.description || ''),
        created: Date.now(),
        startTime: this.tripBeingEdited.startTime + offset,
        endTime: this.tripBeingEdited.endTime === null
          ? null : this.tripBeingEdited.endTime + offset,

        startAddress: this.tripBeingEdited.endAddress,
        startLocation: this.tripBeingEdited.endLocation,
        startLatLng: this.tripBeingEdited.endLatLng,
        startPostcode: this.tripBeingEdited.endPostcode,

        endAddress: this.tripBeingEdited.startAddress,
        endLocation: this.tripBeingEdited.startLocation,
        endLatLng: this.tripBeingEdited.startLatLng,
        endPostcode: this.tripBeingEdited.startPostcode,

        relatedTrip: this.tripBeingEdited.id,
        isReturnTrip: true,
        isTentative: true,
      }

      this.$store.commit('trips/assignNewlyCreatedJob', {trip})
      this.updateTrip('relatedTrip', relatedTripId)
    },

    // Searches through all existing trips and find the
    // one with the same id
    visitRelatedTrip() {
      const result = (this.$store.getters['trips/teamSchedules'] as [Team, ProcessedScheduleData][])
        .map(([team, schedule]): [Team, number] => [team, schedule.trips.findIndex(t => t.id === this.tripBeingEdited.relatedTrip)])
        .find(([team, index]) => index !== -1)

      if (result) {
        const [team, index] = result
        this.$store.commit('tripEditing/editTrip', {team, index})
      } else {
        this.updateTrip('relatedTrip', null)
      }
    }
  }
})
</script>

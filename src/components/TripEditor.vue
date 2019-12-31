<template>
  <div v-if="tripBeingEdited" :key="tripBeingEdited.id" class="trip-editor">
    <v-card-actions>
      <v-layout align-content-end>
        <v-btn
          color="neutral"
          icon
          @click="wantToSendMessage"
          >
          <v-icon>message</v-icon>
        </v-btn>
        <v-btn
          :color="historyShown ? 'primary' : 'neutral'"
          icon
          @click="historyShown = !historyShown"
          >
          <v-icon>history</v-icon>
        </v-btn>
        <v-menu offset-y v-if="!tripBeingEdited.relatedTrip">
          <template v-slot:activator="{on}">
            <v-btn v-on="on" icon>
              <v-icon>looks_two</v-icon>
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
      <MessageHistory v-if="historyShown" :tripId="tripBeingEdited.id" />
      <a href="#" @click.prevent="visitRelatedTrip"
          v-if="tripBeingEdited.relatedTrip && $store.state.trips.trips[tripBeingEdited.relatedTrip]">
        {{tripBeingEdited.isReturnTrip
          ? 'First trip'
          : 'Return trip'}}
      </a>
      <v-textarea
        label="Description"
        :value="tripBeingEdited.description"
        @input="updateTrip('description', $event)"
        rows="1"
        auto-grow
        :disabled="tripBeingEdited.cancelled"
        />

      <TeamsSelect
        label="Assigned to"
        :withNull="true"
        :value="tripKey(tripBeingEdited)"
        @input="reassignTripToTeam($event)"
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
        @input="updateTrip('endTime',
          $event === null ? null
          : $event < tripBeingEdited.startTime ? $event + 86400e3
          : $event)"
        :disabled="tripBeingEdited.cancelled"
        />
      <v-checkbox
        :input-value="tripBeingEdited.isTentative"
        @change="updateTrip('isTentative', $event)"
        label="Timing is tentative"
        />
      <hr/>
      <!-- <SMSSection
        :trip="tripBeingEdited"
        /> -->
      <hr/>
      <v-layout>
        <v-spacer />
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
          {{tripBeingEdited.cancelled ? 'Restore trip' : 'Cancel trip'}}
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
import {Person} from '@/store/vehicles'
import {BLANK_KEY} from '@/store/trips'
import TimeEditor from '@/components/common/TimeEditor.vue'
import TeamsSelect from '@/components/TeamsSelect.vue'
import SMSSection from '@/components/SMSSection.vue'
import PostcodePicker from '@/components/common/PostcodePicker.vue'
import DateEditor from '@/components/common/DateEditor.vue'
import MessageHistory from '@/components/MessageHistory.vue'
import singaporeColors from '@/lib/singaporeColors'
import {} from 'googlemaps'
import {tripKey, TripsState, ProcessedScheduleData} from '@/store/trips'
import uniqueId from '@/lib/uniqueId';
import dateformat from 'dateformat'

export default Vue.extend({
  components: {
    TimeEditor,
    DateEditor,
    PostcodePicker,
    TeamsSelect,
    MessageHistory,
  },

  data() {
    return {
      historyShown: false,
    }
  },

  computed: {
    tripBeingEdited (): Trip {
      return this.$store.getters['tripEditing/tripBeingEdited'] as Trip
    },

    tripKey: () => tripKey,

    singaporeColors: () => singaporeColors,

    deleteAllowed (): Boolean {
      if ((this.$store.state.trips as TripsState).mode.type === 'template') {
        return true
      }
      const now = this.$store.state.time.time
      return (now - this.tripBeingEdited.created) < 15 * 60e3
    },

    message (): string {
      const trip = this.tripBeingEdited
      const condenseAddress = (s: string) =>
        s.replace(/\bSINGAPORE ([0-9]{6})\b/ig, (s, p) => `S(${p})`)
          .replace(/\bstreet\b/ig, 'St')
          .replace(/\broad\b/ig, 'Rd')
          .replace(/\bbukit\b/ig, 'Bt')
          .replace(/\btanjong\b/ig, 'Tg')
          .replace(/\bjalan\b/ig, 'Jln')
          .replace(/\blorong\b/ig, 'Lor')
      const condense = (s: string) => s.trim()
        .replace(/\s+/g, ' ')
      const removeIndent = (s: string) => s.replace(
        /\s+\n\s+/g, '\n'
      )

      const tripPart = trip.description || ''
      const cancelledPart = trip.cancelled ? '(cancelled)' : ''
      const startAddressPart = condenseAddress(`
        ${trip.startAddress || ''} ${trip.startLocation || ''}
      `)
      const endAddressPart = condenseAddress(`
        ${trip.endAddress || ''} ${trip.endLocation || ''}
      `)
      const datePart = dateformat(trip.startTime, 'HH:MM', true)

      return removeIndent(`
      ${condense(tripPart)} ${cancelledPart}
      ${startAddressPart} - ${endAddressPart}
      @${datePart}
      `).trim()
    },

    messageLabel (): string {
      return `Message (${this.message.length} chars)`
    },

    tripRecipientPhoneNumbers (): [Person | null, Person | null] {
      const driver = this.tripBeingEdited.driver
      const medic = this.tripBeingEdited.medic

      const driverPerson = driver &&
        this.$store.state.vehicles.persons[driver.toLowerCase()]
      const medicPerson = medic &&
        this.$store.state.vehicles.persons[medic.toLowerCase()]

      return [driverPerson, medicPerson]
    },
  },

  methods: {
    updateTrip (field: string, value: any): void {
      this.$store.dispatch('tripEditing/updateTripBeingEdited', {[field]: value})
    },

    reassignTripToTeam (key: string): void {
      const team = (key === BLANK_KEY)
        ? {driver: null, medic: null}
        : this.$store.state.trips.teams.find((t: Team) => tripKey(t) === key)

      this.$store.commit('trips/reassignJob', {
        trip: this.tripBeingEdited,
        team
      })
      this.$store.commit('tripEditing/editTrip', {
        tripId: this.tripBeingEdited.id
      })

      // TODO: scroll to the trip
    },

    createReturnTrip(offset: number): void {
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
    visitRelatedTrip(): void {
      const relatedTripId = this.tripBeingEdited.relatedTrip
      const relatedTrip = relatedTripId &&
        (this.$store.state.trips as TripsState).trips[relatedTripId]

      if (relatedTrip) {
        this.$store.commit('tripEditing/editTrip', {tripId: relatedTripId})
      } else {
        this.updateTrip('relatedTrip', null)
      }
    },

    wantToSendMessage(): void {
      this.$store.commit('dialogs/showDialogWithProps', {
        dialog: 'draftMessage',
        props: {
          recipients: this.tripRecipientPhoneNumbers
            .filter(r => r)
            .map(r => r && r.telephone),
          message: this.message,
          trip: this.tripBeingEdited.id,
        }
      })
    }
  }
})
</script>

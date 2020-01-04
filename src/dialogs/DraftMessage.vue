<template>
  <StandardDialog
    title="Send Message"
    name="draftMessage"
    height="80vh"
  >
    <h3>Send to</h3>
    <v-alert
      :value="hasPersonsMissingPhoneNumbers"
      label=""
      >
      Some people on this list do not have phone numbers.
      <strong>They will not receive your message</strong>.
      Please update the phone number list before continuing.
      <v-btn @click="$store.commit('dialogs/showDialog', 'persons')">
        Update the phone number list.
      </v-btn>
    </v-alert>
    <template v-for="(person, i) in persons">
      <span v-if="person.name"
        :key="i">
        {{person.name}}
        ({{person.telephone}})
      </span>
      <span v-else :key="i">
        {{person.telephone}}
      </span>
      <template v-if="i < persons.length - 1">,</template>
    </template>
    <hr/>
    <v-textarea
      label="Message"
      v-model="m.message"
      rows="5"
      auto-grow
      />

    <v-btn
      color="primary"
      @click="sendMessageAndClose"
    >
      Send
    </v-btn>
    <v-btn
      @click="$store.commit('dialogs/hideDialog')"
      >
      Cancel
    </v-btn>

  </StandardDialog>
</template>
<script lang="ts">
import Vue from 'vue'
import {db} from '@/lib/firebase'
import uniqueId from '@/lib/uniqueId'
import {Message, MessageClient} from '@/lib/messages'
import vehiclesStore from '@/store/vehicles'
import {Person} from '@/store/vehicles'
import {TripsState} from '@/store/trips'
import store from '@/store'
import StandardDialog from '@/dialogs/StandardDialog.vue';

interface Recipient {
  name?: string,
  telephone: string,
}

export default Vue.extend({
  props: ['recipients', 'message', 'trip'],

  data () {
    return {
      m: {
        recipients: [],
        message: '',
      }
    }
  },

  components: {
    StandardDialog,
  },

  created () {
    (this as any).$messageClient = new MessageClient(db)
    this.m.recipients = this.recipients
    this.m.message = this.message
  },

  computed: {
    persons(): Recipient[] {
      // Quadratic but who cares
      return this.recipients.map((s: String): Person => {
        return store.getters['vehicles/personArray']
          .find((p: Person) => p.telephone === s)
          || {telephone: s}
      })
    },

    hasPersonsMissingPhoneNumbers(): boolean {
      return this.recipients.length < 2
    }
  },

  methods: {
    sendMessageAndClose(): void {
      ((this as any).$messageClient as MessageClient).createMessage({
        recipients: this.m.recipients,
        message: this.m.message.trim(),
        trip: this.trip,
      })
      if (this.trip && (store.state.trips as TripsState).trips[this.trip]) {
        store.commit('trips/markTripSMSSent', {
          tripId: this.trip,
        })
      }
      store.commit('dialogs/hideDialog')
    }
  }
})
</script>


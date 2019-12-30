<template>
  <StandardDialog
    title="Send Message"
    name="draftMessage"
    height="80vh"
  >
    <h3>Send to</h3>
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
    this.$messageClient = new MessageClient(db)
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
    }
  },

  methods: {
    sendMessageAndClose(): void {
      (this.$messageClient as MessageClient).createMessage({
        recipients: this.m.recipients,
        message: this.m.message.trim(),
      })
      store.commit('dialogs/hideDialog')
    }
  }
})
</script>


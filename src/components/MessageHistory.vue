<template>
  <div class="message-history">
    <template v-if="state === 'loading'">
      Loading...
    </template>
    <template v-else>
      <div v-for="message in messages" class="message">
        <b>{{formatDate(message.created)}}; {{message.recipients.join(', ')}}&gt;</b>
        {{message.message}}
      </div>
    </template>
  </div>
</template>
<style scoped lang="scss">
.message-history {
  border: solid 1px #CCC;

  .message {
    margin: 0.5em;
    border: solid 1px #CCC;
    border-radius: 0.5em;
    background-color: #EEE;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import uniqueId from '@/lib/uniqueId';
import {db} from '@/lib/firebase'
import {Trip} from '@/lib/types'
import firebase from 'firebase/app'
import {Message, parseMessages} from '@/lib/messages'
import dateformat from 'dateformat';

export default Vue.extend({
  props: ['tripId'],

  data () {
    return {
      state: 'loading',
      messages: [] as Message[],
    }
  },

  watch: {
    tripId (v: string | null): void {
      if (!v) {
        this.state = 'done'
        this.messages = []
      } else {
        this.state = 'loading'
        this.loadByTripId(v)
      }
    },
  },

  mounted () {
    this.loadByTripId(this.tripId)
  },

  methods: {
    formatDate(c) {
      return dateformat(c, 'dd-mmm-yy HH:MM')
    },
    loadByTripId(tripId: string) {
      const promise = (this as any).$inflightPromise = db.ref('/sms')
        .orderByChild('trip')
        .equalTo(tripId)
        .once('value')
        .then((w: firebase.database.DataSnapshot) => {
          if (promise !== (this as any).$inflightPromise) {
            return
          }
          this.state = 'done'
          this.messages = parseMessages(w)
        })
    }
  }
})
</script>

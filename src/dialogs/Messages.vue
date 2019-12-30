<template>
  <StandardDialog
    title="Message Log"
    name="messages"
    height="80vh"
  >
    <v-layout column>
      <v-flex>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="maxTime && dateformat(maxTime, 'dd mmm yyyy')"
              clearable
              label="Messages sent on or before"
              readonly
              @click:clear="handleDateInput(null)"
              v-on="on"
              style="width: 250px"
            />
          </template>
          <v-date-picker
            :value="maxTime"
            :max="dateformat(Date.now(), 'yyyy-mm-dd')"
            @input="handleDateInput"
            />
        </v-menu>
      </v-flex>
      <v-flex grow shrink>
        <table class="messages-table" style="width: 100%">
          <thead>
            <tr>
              <th style="width: 4em">S/No</th>
              <th style="width: 20em">Recipients</th>
              <th style="width: 20em">Date</th>
              <th style="width: 60%">Message</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in currentPage.data" :key="row.id">
              <td>{{index + 1}}</td>
              <td>{{row.recipients.join(', ')}}</td>
              <td>{{row.created && dateformat(row.created, 'dd mmm yyyy, HH:MM:ss')}}</td>
              <td>
                {{row.message}}
                <MessageStatusChecker :status="row.status" :id="row.id"
                  @updated="row.status = $event" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">
                <a href="#" @click.prevent="loadMore">Load more</a>
              </td>
            </tr>
          </tfoot>
        </table>
      </v-flex>
    </v-layout>
  </StandardDialog>
</template>
<style lang="scss">
table.messages-table {
  border-collapse: collapse;
  border: solid 1px black;
  width: 100%;

  td, th {
    border: dotted 1px #888;
  }

  td {
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #EEE;
  }

  tr.cancelled td {
    text-decoration: line-through;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {KeyableTrip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import PersonView from '@/dialogs/teams/PersonView.vue';
import StandardDialog from '@/dialogs/StandardDialog.vue';
import MessageStatusChecker from '@/dialogs/messages/MessageStatusChecker.vue';
import dateformat from 'dateformat'
import assert from 'assert';
import _ from 'lodash';

import {db} from '@/lib/firebase'
import uniqueId from '@/lib/uniqueId'
import {Message, MessageClient, parseMessages} from '@/lib/messages'

export default Vue.extend({
  data () {
    return {
      currentPage: {
        data: [] as Message[],
      },

      maxTime: null as string | null,

      errors: {} as {[k: string]: string}
    }
  },

  components: {
    MessageStatusChecker,
    PersonView,
    StandardDialog,
  },

  computed: {
    dateformat: () => dateformat,
    vehicles () {
      return ((store.state as any).vehicles as VehiclesState).vehicles
    },
    teams () {
      return (store.state.trips as TripsState).teams || []
    },
    scheduleByTeam () {
      return (store.state.trips.scheduleByTeam) as ScheduleByTeam
    },
  },

  created () {
    this.loadData()
    ;(this as any).$messageClient = new MessageClient(db)
  },

  methods: {
    // TODO move to MessageClient
    loadData(lastId: number | null = null) {
      if ((this as any).$inflightPromise) return

      const ref = db.ref('/sms')
        .orderByChild('created')

      // Note: unless you key by uniqueId
      // or have very low volume (thus no duplicates)
      // this could easily overlook
      // messages at boundaries
      const filteredRef = lastId
        ? ref.endAt(lastId - 1e-14 * lastId) // rough ulp?
        : ref

      const promise = (this as any).$inflightPromise = filteredRef
        .limitToLast(20)
        .once('value')
        .then((v) => {
          if ((this as any).$inflightPromise !== promise) return

          const messages = parseMessages(v)

          messages.forEach((m: Message) => {
            this.currentPage.data.push(m)
          })

          ;(this as any).$inflightPromise = null
        }, (e) => {
          console.error(e)
          ;(this as any).$inflightPromise = null
        })
    },

    loadMore () {
      if (this.currentPage.data.length === 0) {
        this.loadData(null)
      } else {
        const messages = this.currentPage.data
        this.loadData(messages[messages.length - 1].created)
      }
    },

    handleDateInput(i: string | null) {
      this.maxTime = i
      this.currentPage.data = []
      ;(this as any).$inflightPromise = null
      this.loadData(
        i === null ? null : new Date(i + 'T23:59:59.999+0800').getTime()
      )
    }
  }
})
</script>


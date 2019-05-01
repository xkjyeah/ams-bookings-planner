<template>
  <StandardDialog
    title="Message Log"
    name="messages"
    height="80vh"
  >
    <v-layout column>
      <v-flex>
        <v-menu v-model="isOpen" offset-y>
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="maxTime && dateformat(maxTime, 'dd mmm yyyy')"
              clearable
              label="Messages sent on or before"
              readonly
              @click:clear="handleDateInput(null)"
              v-on="on"
              style="width: 150px"
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
              <td>{{dateformat(row.created, 'dd mmm yyyy, HH:MM:ss')}}</td>
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
                <a href="#" @click.prevent="loadMore">Load more</a> |
                <a href="#" @click.prevent="createDummyMessages">Create dummy messages</a> |
                <a href="#" @click.prevent="clearDummyMessages">Clear dummy messages</a>
              </td>
            </tr>
          </tfoot>
        </table>
      </v-flex>
    </v-layout>
  </StandardDialog>
</template>
<style lang="scss">
// .page-number {
//   list-style-type: none;
//   display: block;
//   margin: 0;
//   padding: 0;

//   li {
//     display: inline-block;

//     &.page-button {
//       width: 1.5em;
//       background-color: #DDD;
//       text-align: center;
//       cursor: pointer;
//       border: solid 1px black;

//       &:hover {
//         background-color: #EEE;
//       }
//     }

//     .page-input {
//       width: 4em;
//       text-align: center;
//     }
//   }
// }
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

type Message = {
  recipients: string[],
  message: string,
  created: number,
  status: string,
  id: string,
}

const dummyMessages = (): Message[] => {
  const s = '0123456789'
  const randomString = () => _.range(0, 8)
    .map(() =>
      s[Math.floor(Math.random() * 10)]
    )
    .join('')
  return _.range(0, 10)
    .map((s: number): Message => {
      const time = Date.now() - Math.random() * (365 * 86400e3)
      return {
        id: uniqueId(),
        created: time,
        message: `Lorem ipsum dolor si ${time}`,
        recipients: [
          randomString(),
          randomString()
        ],
        status: 'unsent',
      }
    })
}

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
  },

  methods: {
    loadData(lastId: number | null = null) {
      if (this.$inflightPromise) return

      const ref = db.ref('/sms')
        .orderByChild('created')

      // Note: unless you key by uniqueId
      // or have very low volume (thus no duplicates)
      // this could easily overlook
      // messages at boundaries
      const filteredRef = lastId
        ? ref.endAt(lastId - 1e-14 * lastId) // rough ulp?
        : ref

      const promise = this.$inflightPromise = filteredRef
        .limitToLast(30)
        .once('value')
        .then((v) => {
          if (this.$inflightPromise !== promise) return

          for (let [key, value] of _.orderBy(Object.entries(v.val()), f => f[1].created, 'desc')) {
            const av = value as any
            this.currentPage.data.push({
              id: av.id || key,
              recipients: (av.recipients || '').split(/,/g).filter(Boolean),
              message: av.message || '',
              status: av.status || '',
              created: parseFloat(av.created) || Date.now(),
            })
          }

          this.$inflightPromise = null
        }, (e) => {
          console.error(e)
          this.$inflightPromise = null
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

    createDummyMessages () {
      db.ref('/sms')
      .update(
        dummyMessages()
        .reduce((acc, o: Message) => {
          acc[o.id] = {
            id: o.id,
            recipients: o.recipients.join(','),
            message: o.message,
            created: o.created,
            status: o.status,
          }
          return acc
        }, {} as {[id: string]: any})
      )
    },

    clearDummyMessages () {
      db.ref('/sms')
      .set(null)
    },

    handleDateInput(i: string | null) {
      this.maxTime = i
      this.currentPage.data = []
      this.$inflightPromise = null
      this.loadData(
        i === null ? null : new Date(i + 'T23:59:59.999+0800').getTime()
      )
    }
  }
})
</script>


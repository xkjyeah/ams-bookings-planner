<template>
  <StandardDialog name="templates" title="Trip templates">
    <v-layout>
      <v-list class="template-list-section">
        <v-list-tile v-for="template in templates"
          :key="template.id"
          @click="selectedTemplateId = template.id">
          <v-layout>
            <div>
              {{template.name}}
            </div>
            <v-spacer />
            <v-icon @click="startEditingTemplate(template)">edit</v-icon>
            <v-menu offset-y>
              <template v-slot:activator="{on}">
                <v-icon v-on="on">more_horiz</v-icon>
              </template>
              <v-list>
                <v-list-tile @click="handleDeleteClick(template.id)">
                  Delete
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-layout>
        </v-list-tile>
        <v-list-tile>
          <v-text-field
            v-model="newTemplate"
            placeholder="(Create new template)"
            @change="insertTemplate($event)"
          />
        </v-list-tile>
      </v-list>
      <div class="table-section">
        <table class="templates-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Start</th>
              <th>End</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody v-if="previewTrips">
            <tr v-for="trip in previewTrips" :key="trip.id"
                :class="{cancelled: trip.cancelled}">
              <td>{{trip.driver}}, {{trip.medic}}</td>
              <td>{{dateformat(trip.startTime, 'HH:MM', true)}}</td>
              <td>{{trip.endTime && dateformat(trip.endTime, 'HH:MM', true)}}</td>
              <td>
                <div>{{trip.description}}</div>
                <div v-if="trip.startAddress || trip.startLocation">
                  <b>From: </b>{{trip.startAddress}} {{trip.startLocation}}</div>
                <div v-if="trip.endAddress || trip.endLocation">
                  <b>To: </b>{{trip.endAddress}} {{trip.endLocation}}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-layout>
  </StandardDialog>
</template>
<style scoped lang="scss">
.template-list-section { flex: 1 1 33%; }
.table-section { flex: 1 1 67%; }
table.templates-table {
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
import {Team, KeyableTrip, Trip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey, ProcessedScheduleData, deserializeArray, readTeams, readTrips, AppMode} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import StandardDialog from '@/dialogs/StandardDialog.vue';
import assert from 'assert';
import dateformat from 'dateformat';
import { db } from '@/lib/firebase';
import _ from 'lodash';
import uniqueId from '@/lib/uniqueId';
import { TemplateMetadata } from '@/store/templates';

export default Vue.extend({
  data () {
    return {
      newTemplate: '',
      selectedTemplateId: null as string | null,
      previewTrips: null as Trip[] | null,
    }
  },

  computed: {
    templates(): TemplateMetadata[] {
      return _.values(this.$store.state.templates.templates)
    }
  },

  watch: {
    selectedTemplateId(v: string | null) {
      if (v) {
        readTrips({type: 'template', template: v})
        .then((trips: Trip[]) => {
          this.previewTrips = trips
        })
      }
    },
  },

  components: {
    StandardDialog
  },

  created() {
    this.$store.dispatch('templates/readTemplates')
  },

  methods: {
    insertTemplate(name: string) {
      this.$store.dispatch('templates/updateTemplate', {
        name,
        id: uniqueId(),
        created: Date.now(),
      })
      this.newTemplate = ''
    },

    handleDeleteClick(templateId: string) {
      if (confirm("Are you sure you want to delete this template?")) {
        this.$store.dispatch('templates/deleteTemplate', {
          id: templateId,
        })
      }
    },

    startEditingTemplate(template: TemplateMetadata) {
      const mode: AppMode = {
        type: 'template',
        template: template.id,
      }
      this.$store.dispatch('trips/setMode', mode)
      this.$store.commit('dialogs/hideDialog')
    }
  }
})
</script>


<template>
  <v-layout column class="app-app">
    <v-layout class="controls" row
        :class="{
          'app-showing-template': $store.state.trips.mode.type === 'template',
          'hidden-in-print': true,
        }"

    >
      <DatePicker v-if="$store.state.trips.mode.type === 'date'"
          style="flex: 0 0 100px" />
      <h2 v-if="$store.state.trips.mode.type === 'template'">
        <v-icon @click="goBack()">chevron_left</v-icon>
        {{templateName}}
      </h2>

      <!-- <v-radio-group
        row
        v-model="xAxisScale">
        <v-radio
          label="Small"
          :value="100"
          />
        <v-radio
          label="Medium"
          :value="200"
          />
        <v-radio
          label="Large"
          :value="400"
          />
      </v-radio-group> -->
      <v-spacer />
      <div>
        {{$store.state.login.user}}
      </div>
      <v-btn @click="showDialog('manifest')">
        Show Manifest
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{on}">
          <v-btn v-on="on">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile @click="showDialog('teams')">
            Teams
          </v-list-tile>
          <v-list-tile @click="showDialog('persons')">
            Individuals
          </v-list-tile>
          <!-- <v-list-tile @click="showDialog('importTeams')">
            Import teams
          </v-list-tile> -->
          <v-list-tile @click="showDialog('templates')">
            Job templates
          </v-list-tile>
          <v-list-tile @click="showDialog('messages')">
            SMS History
          </v-list-tile>
          <v-divider />
          <v-list-tile @click="signOut()">
            Sign out
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-layout>
    <TripEditor class="trip-editor-window hidden-in-print" />
    <ChartArea
      class="chart-area hidden-in-print"
      ref="chart-area"
      :xAxisScale="xAxisScale"
      :yAxisScale="yAxisScale"
      @trip-clicked="$store.commit('tripEditing/editTrip', $event)"
      />
    <v-btn
      @click="createNewTrip"
      class="hidden-in-print"
      dark
      fab
      color="pink"
      style="bottom: 1em; right: 2em; position: absolute"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <TimeUpdater />
    <VehiclesSync />
    <TripsSync />

    <PrintableManifest />

    <TeamsDialog v-if="$store.state.dialogs.activeDialog === 'teams'" />
    <PersonsDialog v-else-if="$store.state.dialogs.activeDialog === 'persons'" />
    <ManifestDialog v-else-if="$store.state.dialogs.activeDialog === 'manifest'" />
    <MessagesDialog v-else-if="$store.state.dialogs.activeDialog === 'messages'" />
    <DraftMessageDialog v-else-if="$store.state.dialogs.activeDialog === 'draftMessage'"
      v-bind="$store.state.dialogs.props"/>
    <ImportTeamsDialog v-else-if="$store.state.dialogs.activeDialog === 'importTeams'" />
    <TemplatesDialog v-else-if="$store.state.dialogs.activeDialog === 'templates'" />
  </v-layout>
</template>

<style lang="scss">
.planner-chart {
  position: relative;
}
.placeholder {
  color: #888;
}
.app-app {
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
}
</style>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;

  .controls {
    flex: 0 0 auto;
  }
  .chart-area {
    flex: 1 1 auto;
  }

  .trip-editor-window {
    position: fixed;
    right: 1em;
    top: 1em;
    bottom: 1em;
    width: 33vw;
    background: white;
    box-shadow: 0.5em 0.5em 1em rgba(0,0,0,0.5);
    z-index: 9;
    box-sizing: border-box;
  }
}
.app-showing-template {
  background: #88F;
  color: #FFF;
}
</style>


<script lang="ts">
import _ from 'lodash';
import querystring from 'querystring';
import Vue from 'vue';
import {Trip, KeyableTrip} from '@/lib/types.ts';
import {TripsState, AppMode} from '@/store/trips.ts';
import {ScreenState} from '@/store/screen.ts';
import {TemplateMetadata} from '@/store/templates.ts';
import {initializeHashWatch} from '@/store/modes'
import ChartArea from '@/components/chart/ChartArea.vue';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import TripEditor from '@/components/TripEditor.vue';
import DatePicker from '@/components/DatePicker.vue';
import PrintableManifest from '@/components/PrintableManifest.vue';
import TeamsDialog from '@/dialogs/Teams.vue';
import PersonsDialog from '@/dialogs/Persons.vue';
import ManifestDialog from '@/dialogs/Manifest.vue';
import MessagesDialog from '@/dialogs/Messages.vue';
import DraftMessageDialog from '@/dialogs/DraftMessage.vue';
import TemplatesDialog from '@/dialogs/Templates.vue';
import ImportTeamsDialog from '@/dialogs/ImportTeams.vue';
import VehiclesSync from '@/sync/VehiclesSync.vue';
import TripsSync from '@/sync/TripsSync.vue';
import store from '@/store';
import defaultData from '@/assets/default-data';
import {auth} from '@/lib/firebase'

export default Vue.extend({
  name: 'app',
  data () {
    return {
      xAxisScale: 150,
      yAxisScale: 25,
    }
  },
  computed: {
    _: () => _,

    chartAreaWidth () {
      return 24 * this.xAxisScale
    },

    chartAreaHeight () {
      return store.getters['trips/rowCount'] * this.yAxisScale
    },

    trips (): Trip[] {
      return store.getters['trips/trips']
    },

    teamSchedules () {
      return (store.getters as any)['trips/teamSchedules']
    },

    templateName (): string | undefined {
      const mode: AppMode = this.$store.state.trips.mode
      if (mode.type !== 'template') return
      const templateId = mode.template
      const templateMetadata: TemplateMetadata | undefined =
        (Object.values(this.$store.state.templates.templates) as TemplateMetadata[])
          .find((t: TemplateMetadata) => t.id === templateId)
      return templateMetadata ? templateMetadata.name : templateId
    }
  },
  components: {
    ChartArea,
    DatePicker,
    DraftMessageDialog,
    ImportTeamsDialog,
    ManifestDialog,
    MessagesDialog,
    PersonsDialog,
    PrintableManifest,
    TimeUpdater,
    TeamList,
    TeamsDialog,
    TemplatesDialog,
    TripEditor,
    TripsSync,
    VehiclesSync,
  },
  created () {
    initializeHashWatch(this.$store)
  },
  mounted () {
    this.scrollToCurrentTime()
  },
  methods: {
    scrollToCurrentTime () {
      (this.$refs['chart-area'] as any).scrollToCurrentTime()
    },
    showDialog (dialogName: string) {
      store.commit('dialogs/showDialog', dialogName)
    },

    createNewTrip () {
      const midnight = new Date
      midnight.setHours(0, 0, 0, 0)
      const delayedTime = (Date.now() - midnight.getTime()) + 10 * 60e3
      const alignedTime = Math.ceil(delayedTime / 5 / 60e3) * 5 * 60e3
      const currentMode = (store.state.trips as TripsState).mode

      const sameDate = (d1n: number, d2: Date) => {
        const d1 = new Date(d1n)
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
      }
      // If it's today, create a new trip at around
      // the current time
      if (currentMode.type === 'date' && sameDate(currentMode.timestamp, midnight)) {
        store.dispatch('tripEditing/createAndEditNewTripAtTime', {
          time: Math.min(
            23.75 * 3600e3,
            alignedTime,
          ),
        })
        this.scrollToCurrentTime()
      } else {
        store.dispatch('tripEditing/createAndEditNewTripAtTime', {
          time: Math.min(
            23.75 * 3600e3,
            Math.ceil((this.$store.state.screen as ScreenState).scrollTime / 900e3) * 900e3
          ),
        })
      }
    },

    importJobs () {
      // initialize data
      store.commit('trips/importJobs', defaultData())
    },

    goBack() {
      const currentMode: AppMode = this.$store.state.trips.mode
      const targetMode: AppMode = {
        type: 'date',
        timestamp: currentMode.type === 'date' ? currentMode.timestamp: currentMode.lastTimestamp
      }
      this.$store.dispatch('trips/setMode', targetMode)
    },

    signOut () {
      this.$store.dispatch('login/signOut')
    },
  }
});
</script>

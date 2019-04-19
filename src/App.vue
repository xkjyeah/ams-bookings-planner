<template>
  <v-app class="app">
    <v-layout class="controls" row
        :class="{
          'app-showing-template': $store.state.trips.mode.type === 'template'
        }"
        align-content-start
    >
      <DatePicker v-if="$store.state.trips.mode.type === 'date'"
          style="flex: 0 0 100px" />
      <h2 v-if="$store.state.trips.mode.type === 'template'">
        <v-icon @click="goBack()">chevron_left</v-icon>
        {{templateName}}
      </h2>

      <v-radio-group
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
      </v-radio-group>
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
            Manage teams
          </v-list-tile>
          <v-list-tile @click="showDialog('persons')">
            Manage people
          </v-list-tile>
          <v-list-tile @click="showDialog('importTeams')">
            Import teams
          </v-list-tile>
          <v-list-tile @click="showDialog('templates')">
            Manage job templates
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-layout>
    <TripEditor class="trip-editor-window" />
    <ChartArea
      class="chart-area"
      ref="chart-area"
      :xAxisScale="xAxisScale"
      :yAxisScale="yAxisScale"
      @trip-clicked="$store.commit('tripEditing/editTrip', $event)"
      />
    <v-btn
      @click="showNewTripDialog"
      dark
      fab
      color="pink"
      style="bottom: 1em; right: 2em; position: absolute"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <TimeUpdater />
    <VehiclesSync />
    <TeamsDialog />
    <PersonsDialog />
    <ManifestDialog />
    <ImportTeamsDialog />
    <TemplatesDialog />
  </v-app>
</template>

<style lang="scss">
.planner-chart {
  position: relative;
}
.placeholder {
  color: #888;
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
    z-index: 999;
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
import {TemplateMetadata} from '@/store/templates.ts';
import {initializeHashWatch} from '@/store/modes'
import ChartArea from '@/components/chart/ChartArea.vue';
import TeamList from '@/components/chart/TeamList.vue';
import TimeUpdater from '@/components/util/TimeUpdater.vue';
import TripEditor from '@/components/TripEditor.vue';
import DatePicker from '@/components/DatePicker.vue';
import TeamsDialog from '@/dialogs/Teams.vue';
import PersonsDialog from '@/dialogs/Persons.vue';
import ManifestDialog from '@/dialogs/Manifest.vue';
import TemplatesDialog from '@/dialogs/Templates.vue';
import ImportTeamsDialog from '@/dialogs/ImportTeams.vue';
import VehiclesSync from '@/sync/VehiclesSync.vue';
import store from '@/store';
import defaultData from '@/assets/default-data';

export default Vue.extend({
  name: 'app',
  data () {
    return {
      xAxisScale: 100,
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
    ImportTeamsDialog,
    ManifestDialog,
    PersonsDialog,
    TimeUpdater,
    TeamList,
    TeamsDialog,
    TemplatesDialog,
    TripEditor,
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

    showNewTripDialog () {
      const midnight = new Date
      midnight.setHours(0, 0, 0, 0)
      const delayedTime = (Date.now() - midnight.getTime()) + 10 * 60e3
      const alignedTime = Math.ceil(delayedTime / 5 / 60e3) * 5 * 60e3
      store.dispatch('tripEditing/createAndEditNewTripAtTime', {
        time: alignedTime,
      })
      this.scrollToCurrentTime()
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
    }
  }
});
</script>

<template>
  <v-dialog
    :value="dialogShown"
    @input="handleDialogInput"
    scrollable
    >
    <v-card>
      <v-card-title>
        <v-layout>
          <h2>Import teams from date</h2>
          <v-spacer />
          <v-btn small icon @click="handleDialogInput">
            <v-icon>close</v-icon>
          </v-btn>
        </v-layout>
      </v-card-title>
      <v-card-text>
        <v-layout>
          <v-date-picker v-model="selectedDate" landscape
            @input="updatePreview"
          />
          <div class="preview-pane">
            <table class="preview-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Driver</th>
                  <th>Medic</th>
                  <th>Vehicle</th>
                </tr>
              </thead>
              <tbody v-if="preview">
                <tr v-for="(team, i) in preview.slice(0, 100)"
                    :key="i">
                  <td></td>
                  <td>
                    <template v-if="team.driver">{{team.driver}}</template>
                    <span v-else class="placeholder">(No driver)</span>
                  </td>
                  <td>
                    <template v-if="team.medic">{{team.medic}}</template>
                    <span v-else class="placeholder">(No medic)</span>
                  </td>
                  <td>
                    <template v-if="team.vehicle">{{team.vehicle}}</template>
                    <span v-else class="placeholder">(No vehicle)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-layout>
        <div>
          <v-btn :disabled="selectedDate === null"
            color="primary"
            @click="handleImport">Import</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.teams-grid {
  display: flex;
  flex-direction: row;
  height: 2em;

  & > div.action {
    border: dashed 1px #ccc;
    flex: 0 0 3em;
  }
  & > div.cell {
    border: dashed 1px #ccc;
    flex: 0 0 calc((100% - 3em) / 3);
  }

}

.preview-pane {
  height: 50vh;
  overflow-y: scroll;
}

.preview-table  {
  width: 400px;

  .placeholder {
    color: #888;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {Team, KeyableTrip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey, deserializeArray, readTeams} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import EditingCell from '@/dialogs/teams/EditingCell.vue';
import PersonView from '@/dialogs/teams/PersonView.vue';
import VehicleView from '@/dialogs/teams/VehicleView.vue';
import EditingDropdown from '@/dialogs/teams/EditingDropdown.vue';
import assert from 'assert';
import { db } from '@/lib/firebase';

export default Vue.extend({
  data () {
    return {
      selectedDate: null as null | string,
      preview: null as Team[] | null,
    }
  },

  components: {
    EditingCell,
    EditingDropdown,
    PersonView,
    VehicleView,
  },

  computed: {
    dialogShown () {
      return (store.state as any).dialogs.activeDialog == 'importTeams'
    },
  },

  methods: {
    handleDialogInput () {
      this.$store.commit('dialogs/hideDialog')
    },
    updatePreview () {
      if (this.selectedDate) {
        readTeams(new Date(this.selectedDate))
        .then((v) => {
          this.preview = v
        })
      } else {
        this.preview = null
      }
    },

    handleImport () {
      if (this.selectedDate) {
        readTeams(new Date(this.selectedDate))
          .then((teams: Team[]) => {
            const teamsById = _.keyBy(
              this.$store.state.trips.teams,
              tripKey
            )

            const teamsToAdd = teams.filter(team =>
              !(tripKey(team) in teamsById)
            )

            this.$store.commit('trips/updateTeams',
              this.$store.state.trips.teams.concat(teamsToAdd)
            )

            this.$store.commit('dialogs/showDialog', 'teams')
          })
      }
    },
  }
})
</script>


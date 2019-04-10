<template>
  <v-dialog
    :value="dialogShown"
    @input="handleDialogInput"
    @dragover="handleDialogDraggedOver"
    scrollable
    >
    <v-card>
      <v-card-title>Manage teams</v-card-title>
      <v-card-text style="height: 80vh">
        <h1>Teams</h1>

        <!-- fixme: choose a better key -->
        <div v-for="(team, i) in teams"
          :key="`${team.driver},${team.medic}`"
          class="teams-grid">

          <div class="action">
            <span @click="dropTeam(i)" v-if="!teamHasTrips(team)">
              <v-icon>delete</v-icon>
            </span>
          </div>

          <EditingCell class="cell" :disabled="teamHasTrips(team)">
            {{team.driver}}
            <template v-slot:editor="editor">
              <EditingDropdown
                :items="defaultList"
                :value="team.driver"
                @blur="editor.blur()"
                @input="updateTeam(i, $event, 'driver')"
              />
            </template>
          </EditingCell>
          <EditingCell class="cell" :disabled="teamHasTrips(team)">
            {{team.medic}}
            <template v-slot:editor="editor">
              <EditingDropdown
                :items="defaultList"
                :value="team.medic"
                @blur="editor.blur()"
                @input="updateTeam(i, $event, 'medic')"
              />
            </template>
          </EditingCell>
          <EditingCell class="cell">
            {{team.vehicle}}
            <template v-slot:editor="editor">
              <EditingDropdown
                :items="$store.state.vehicles.vehicles.map(r => r.registrationNumber)"
                :value="team.vehicle"
                @blur="editor.blur()"
                @input="updateTeam(i, $event, 'vehicle')"
                />
            </template>
          </EditingCell>
        </div>
        <div class="teams-grid">

          <div class="action">
            (New)
          </div>

          <EditingCell class="cell">
            <span class="placeholder">(Driver)</span>
            <template v-slot:editor="editor">
              <EditingDropdown
                :items="defaultList"
                :value="''"
                @blur="editor.blur()"
                @input="createNewTeam($event, 'driver')"
              />
            </template>
          </EditingCell>
          <EditingCell class="cell">
            <span class="placeholder">(Medic)</span>
            <template v-slot:editor="editor">
              <EditingDropdown
                :items="defaultList"
                :value="''"
                @blur="editor.blur()"
                @input="createNewTeam($event, 'medic')"
              />
            </template>
          </EditingCell>
          <EditingCell class="cell" :disabled="true">
            <span class="placeholder">(Vehicle)</span>
            <template v-slot:editor="editor">
            </template>
          </EditingCell>
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

  .placeholder {
    color: #888;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {TripsState, ScheduleByTeam, KeyableTrip, tripKey} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import EditingCell from '@/dialogs/teams/EditingCell';
import EditingDropdown from '@/dialogs/teams/EditingDropdown';
import assert from 'assert';

export default Vue.extend({
  data () {
    return {
      defaultList: [
        'Arsad','Azrul','Bernard','Charlie','Christian','Ema','Erifin','Farhan',
        'FC Sam','Govin','Heman','Huq','Jack','James','Jamil','Jimmy','Keith','Khaw','Kid',
        'Loo','Mahmod','Mala','Meeran','Mohan','Muzaimi','Nonito','Obon','Peter','Razali',
        'Rezal','Roshan','Sam','Sapari','Seng','Sephora','Simon','Siti','Steven','Sufi','Sun',
        'Tj','Tony','Wen','Xandra','Yasin','Yatim','Yazid','Zhelter','Zie','Zol',
      ],
      draggedOver: true,
    }
  },

  components: {
    EditingCell,
    EditingDropdown,
  },

  computed: {
    dialogShown () {
      return (store.state as any).dialogs.activeDialog == 'teams'
    },
    vehicles () {
      return (store.state.vehicles as VehiclesState).vehicles
    },
    teams () {
      return (store.state.trips as TripsState).teams || []
    },
    staffList (): ({text: string, value: string}[]) {
      return this.defaultList.map(s => ({text: s, value: s}))
    },
    scheduleByTeam () {
      return (store.state.trips.scheduleByTeam) as ScheduleByTeam
    },
  },

  methods: {
    handleDialogInput (inp: any) {
      if (!inp) {
        store.commit('dialogs/hideDialog')
      }
    },

    handleMemberDrag(event: DragEvent, member: string) {
      // event.preventDefault()
      if (!event.dataTransfer) throw new Error('Unexpected null dataTransfer')

      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.dropEffect = "move"
      // Firefox insists on this to activate the drag
      event.dataTransfer.setData('text/member-drag', member)
    },

    handleVehicleDrag(event: DragEvent, vehicle: string) {
      // event.preventDefault()
      if (!event.dataTransfer) throw new Error('Unexpected null dataTransfer')

      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.dropEffect = "move"
      // Firefox insists on this to activate the drag
      event.dataTransfer.setData('text/vehicle-drag', vehicle)
    },

    handleDialogDraggedOver(event: DragEvent) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'cancel'
    },

    createNewTeam(value: string, known: 'driver' | 'medic' | 'vehicle') {
      store.commit('trips/updateTeams', this.teams.concat([
        {
          driver: known == 'driver' ? value : null,
          medic: known == 'medic' ? value : null,
          vehicle: known == 'vehicle' ? value : null,
        }
      ]))
    },

    updateTeam(index: number, value: string, known: 'driver' | 'medic' | 'vehicle') {
      const current = this.teams[index]

      assert(current)

      store.commit('trips/updateTeams',
        this.teams.slice(0, index)
        .concat([{
          ...current,
          [known]: value
        }])
        .concat(this.teams.slice(index + 1))
      )
    },

    dropTeam(index: number) {
      store.commit('trips/updateTeams',
        this.teams.slice(0, index)
        .concat(this.teams.slice(index + 1))
      )
    },

    teamHasTrips(team: KeyableTrip):boolean {
      return this.scheduleByTeam[tripKey(team)] &&
        this.scheduleByTeam[tripKey(team)].trips.length > 0
    }
  }
})
</script>


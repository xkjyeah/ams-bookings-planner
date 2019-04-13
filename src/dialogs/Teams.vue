<template>
  <StandardDialog
    title="Manage teams"
    name="teams"
    height="80vh"
  >
    <!-- fixme: choose a better key -->
    <div v-for="(team, i) in teams"
      :key="`${team.driver},${team.medic}`"
      :data-key="`${team.driver},${team.medic}`"
      ref="teamsGrid">

      <div class="teams-grid">
        <div class="action">
          <span @click="dropTeam(i)" v-if="!teamHasTrips(team)">
            <v-icon>delete</v-icon>
          </span>
        </div>

        <EditingCell class="cell" :disabled="teamHasTrips(team)">
          <PersonView :value="team.driver" placeholder="(Driver)" />
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
          <VehicleView :value="team.vehicle" placeholder="(No vehicle)" />
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
      <v-alert
        v-if="errors[i]"
        :value="true"
        type="error"
      >
        {{errors[i]}}
      </v-alert>
    </div>
    <div class="teams-grid">

      <div class="action">
        (New)
      </div>

      <EditingCell class="cell">
        <template v-if="newTeam.driver">
          {{newTeam.driver}}
        </template>
        <span v-else class="placeholder">(Driver)</span>
        <template v-slot:editor="editor">
          <EditingDropdown
            :items="defaultList"
            :value="newTeam.driver"
            @input="newTeam.driver = $event"
            @blur="editor.blur()"
          />
        </template>
      </EditingCell>
      <EditingCell class="cell">
        <template v-if="newTeam.medic">
          {{newTeam.medic}}
        </template>
        <span v-else class="placeholder">(Medic)</span>
        <template v-slot:editor="editor">
          <EditingDropdown
            :items="defaultList"
            :value="newTeam.medic"
            @input="newTeam.medic = $event"
            @blur="editor.blur()"
          />
        </template>
      </EditingCell>
      <EditingCell class="cell"
          @focus.native="maybeCreateTeam"
          :disabled="true">
        <span class="placeholder">(Vehicle)</span>
        <template v-slot:editor="editor">
        </template>
      </EditingCell>
    </div>
    <v-alert
      v-if="errors['new']"
      :value="true"
      type="error"
    >
      {{errors['new']}}
    </v-alert>
  </StandardDialog>
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
import {KeyableTrip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import EditingCell from '@/dialogs/teams/EditingCell.vue';
import PersonView from '@/dialogs/teams/PersonView.vue';
import VehicleView from '@/dialogs/teams/VehicleView.vue';
import EditingDropdown from '@/dialogs/teams/EditingDropdown.vue';
import StandardDialog from '@/dialogs/StandardDialog.vue';
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

      newTeam: {
        driver: null,
        medic: null,
        vehicle: null,
      },

      errors: {} as {[k: string]: string}
    }
  },

  components: {
    EditingCell,
    EditingDropdown,
    PersonView,
    StandardDialog,
    VehicleView,
  },

  computed: {
    dialogShown () {
      return (store.state as any).dialogs.activeDialog == 'teams'
    },
    vehicles () {
      return ((store.state as any).vehicles as VehiclesState).vehicles
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

      const newTeam = {
        ...current,
        [known]: value
      }

      if (this.teamExists(index, newTeam)) {
        return this.flashError(index, `This team (${newTeam.driver}, ${newTeam.medic}) already exists`)
      }

      store.commit('trips/updateTeams',
        this.teams.slice(0, index)
        .concat([newTeam])
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
    },

    // Argh hacky way of handling this. Dammit. How to prevent
    teamExists(notInIndex: number | null, team: KeyableTrip): boolean {
      return !!this.teams.find((existingTeam: KeyableTrip, index: number): boolean => {
        if (index === notInIndex) return false

        if (team.driver === existingTeam.driver &&
            team.medic === existingTeam.medic) {
          return true
        }

        return false
      })
    },

    flashError(index: number | 'new', message: string) {
      this.errors = {...this.errors, [index.toString()]: message}
      setTimeout(() => {
        if (this.errors[index.toString()] === message) {
          const {[index.toString()]: a, ...rest} = this.errors
          this.errors = rest
        }
      }, 4000)
    },

    maybeCreateTeam (): void {
      if (this.newTeam.driver || this.newTeam.medic) {
        const {driver, medic} = this.newTeam

        if (this.teamExists(null, this.newTeam)) {
          return this.flashError('new', `This team (${driver}, ${medic}) already exists`)
        }

        store.commit('trips/updateTeams', this.teams.concat([
          {driver, medic, vehicle: null}
        ]))
        this.newTeam = {driver: null, medic: null, vehicle: null}
        this.$nextTick(() => {
          const key = `${driver},${medic}`
          const wrapper = (this.$refs.teamsGrid as Element[] as HTMLElement[])
            .find(d => d.dataset.key === key)
          const inputs = wrapper &&
            [...wrapper.querySelectorAll('.cell')] as HTMLInputElement[] | null

          if (inputs) {
            inputs[inputs.length - 1].focus()
          }
        })
      }
    }
  }
})
</script>


<template>
  <v-dialog
    :value="dialogShown"
    @input="handleDialogInput"
    @dragover="handleDialogDraggedOver"
    >
    <v-card>
      <h1>Ambulance Staff</h1>
      <span v-for="member in defaultList"
          :key="member"
          class="member"
          draggable
          @dragstart="handleMemberDrag($event, member)">
        {{member}}
      </span>
      <h1>Vehicles</h1>
      <span v-for="vehicle in vehicles"
          :key="vehicle.registrationNumber"
          @dragstart="handleVehicleDrag($event, vehicle.registrationNumber)"
          draggable
          class="vehicle">
        {{vehicle.registrationNumber}}
      </span>
      <h1>Teams</h1>
      <div v-for="(team, i) in teams" :key="team.driver + ',' + team.name" class="team">
        <DragDestination
          @drop="updateTeam(i, 'driver', $event)"
          expectType="text/member-drag">
          <div class="driver" v-if="team.driver">
            <span class="member">{{team.driver}}</span>
          </div>
          <div class="driver" v-else>
            None
          </div>
        </DragDestination>

        <DragDestination
          @drop="updateTeam(i, 'medic', $event)"
          expectType="text/member-drag">
          <div class="medic" v-if="team.medic">
            <span class="member">{{team.medic}}</span>
          </div>
          <div class="medic" v-else>
            None
          </div>
        </DragDestination>

        <DragDestination
          @drop="updateTeam(i, 'vehicle', $event)"
          expectType="text/vehicle-drag">
          <div v-if="team.vehicle">
            <span class="vehicle">{{team.vehicle}}</span>
          </div>
          <div v-else>
            None
          </div>
        </DragDestination>
      </div>
      <div class="team">
        <DragDestination expectType="text/member-drag"
          @drop="createNewTeam('driver', $event)">
          <div class="driver">
            None
          </div>
        </DragDestination>
        <DragDestination expectType="text/member-drag"
          @drop="createNewTeam('medic', $event)">
          <div class="medic">
            None
          </div>
        </DragDestination>
        <DragDestination expectType="text/vehicle-drag"
          @drop="createNewTeam('vehicle', $event)">
          <div>
            None
          </div>
        </DragDestination>
      </div>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.team {
  border: dashed 2px #CCC;
  display: inline-flex;
  width: 15em;
  margin: 0.2em 0.1em;

  & > div {
    flex: 1 1 0;
    border: dashed 2px #CCC;
    margin: 0.2em 0.1em;
  }
}
.member {
  background: #909;
  color: white;
  border-radius: 0.3em;
  padding: 0 0.3em;
  margin: 0 0.1em;
  display: inline-block;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vehicle {
  background: #090;
  color: white;
  border-radius: 0.3em;
  padding: 0 0.3em;
  margin: 0 0.1em;
  display: inline-block;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {TripsState} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import DragDestination from '@/dialogs/teams/DragDestination';
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
    DragDestination,
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

    createNewTeam(known: 'driver' | 'medic' | 'vehicle', e: DragEvent) {
      const member = e.dataTransfer.getData('text/member-drag')
      const vehicle = e.dataTransfer.getData('text/vehicle-drag')
      store.commit('trips/updateTeams', this.teams.concat([
        {
          driver: known == 'driver' ? member : null,
          medic: known == 'medic' ? member : null,
          vehicle: known == 'vehicle' ? vehicle : null,
        }
      ]))
    },

    updateTeam(index: number, known: 'driver' | 'medic' | 'vehicle', e: DragEvent) {
      const member = e.dataTransfer.getData('text/member-drag')
      const vehicle = e.dataTransfer.getData('text/vehicle-drag')
      const current = this.teams[index]

      assert(current)

      store.commit('trips/updateTeams',
        this.teams.slice(0, index)
        .concat([{
          ...current,
          [known]: (known === 'vehicle' ? vehicle : member)
        }])
        .concat(this.teams.slice(index + 1))
      )
    },
  }
})
</script>


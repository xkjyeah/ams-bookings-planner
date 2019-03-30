<template>
  <v-dialog
    :value="dialogShown"
    @input="handleDialogInput"
    >
    <v-card>
      <h1>Ambulance Staff</h1>
      <span v-for="member in defaultList"
          :key="member"
          class="member">
        {{member}}
      </span>
      <h1>Vehicles</h1>
      <span v-for="vehicle in vehicles"
          :key="vehicle.registrationNumber"
          class="vehicle">
        {{vehicle.registrationNumber}}
      </span>
      <h1>Teams</h1>
      <div v-for="team in teams" :key="team.driver + ',' + team.name" class="team">
        <div class="driver" v-if="team.driver">
          <span class="member">{{team.driver}}</span>
        </div>
        <div class="driver" v-else>
          None
        </div>

        <div class="medic" v-if="team.medic">
          <span class="member">{{team.medic}}</span>
        </div>
        <div class="medic" v-else>
          None
        </div>
      </div>
      <div class="team">
        <div class="driver">
          None
        </div>
        <div class="medic">
          None
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.team {
  border: dashed 2px #CCC;
  display: inline-flex;
  width: 10em;

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
}
.vehicle {
  background: #090;
  color: white;
  border-radius: 0.3em;
  padding: 0 0.3em;
  margin: 0 0.1em;
  display: inline-block;
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {TripsState} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';

export default Vue.extend({
  data () {
    return {
      defaultList: [
        'Arsad','Azrul','Bernard','Charlie','Christian','Ema','Erifin','Farhan',
        'FC Sam','Govin','Heman','Huq','Jack','James','Jamil','Jimmy','Keith','Khaw','Kid',
        'Loo','Mahmod','Mala','Meeran','Mohan','Muzaimi','Nonito','Obon','Peter','Razali',
        'Rezal','Roshan','Sam','Sapari','Seng','Sephora','Simon','Siti','Steven','Sufi','Sun',
        'Tj','Tony','Wen','Xandra','Yasin','Yatim','Yazid','Zhelter','Zie','Zol',
      ]
    }
  },

  computed: {
    dialogShown () {
      return (store.state as any).dialogs.activeDialog == 'teams'
    },
    vehicles () {
      console.log(store.state)
      return (store.state.vehicles as VehiclesState).vehicles
    },
    teams () {
      return (store.state.trips as TripsState).teams
    },
  },

  methods: {
    handleDialogInput (inp: any) {
      if (!inp) {
        store.commit('dialogs/hideDialog')
      }
    }
  }
})
</script>


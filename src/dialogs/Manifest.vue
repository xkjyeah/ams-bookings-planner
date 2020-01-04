<template>
  <StandardDialog name="manifest" title="Trip manifest">
    <div slot="header">
      <v-checkbox v-model="showHiddenTrips" label="Show hidden trips" />
    </div>
    <ManifestComponent :showHiddenTrips="showHiddenTrips" />
  </StandardDialog>
</template>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import {Team, KeyableTrip, Trip} from '@/lib/types'
import {TripsState, ScheduleByTeam, tripKey, ProcessedScheduleData, deserializeArray, readTeams} from '@/store/trips'
import { VehiclesState } from '@/store/vehicles';
import StandardDialog from '@/dialogs/StandardDialog.vue';
import ManifestComponent from '@/components/Manifest.vue';
import assert from 'assert';
import dateformat from 'dateformat';
import { db } from '@/lib/firebase';
import _ from 'lodash';

export default Vue.extend({
  data () {
    return {
      showHiddenTrips: false,
    }
  },

  components: {
    StandardDialog,
    ManifestComponent,
  },

  computed: {
    dateformat: () => dateformat,
  },

  methods: {
    handleDialogInput () {
      this.$store.commit('dialogs/hideDialog')
    },
  }
})
</script>


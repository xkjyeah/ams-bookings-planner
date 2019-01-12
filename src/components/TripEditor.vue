<template>
  <div v-if="tripBeingEdited">
    {{tripBeingEdited.description}}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Trip } from '@/lib/types';
import {TripEditingState} from '@/store/tripEditing'

export default Vue.extend({
  computed: {
    tripBeingEdited (): Trip {
      return this.$store.getters['tripEditing/tripBeingEdited'] as Trip
    }
  }
})
</script>

<template>
<g>
  <line v-for="([team, data], i) in teamSchedules"
    v-if="data.row === data.rowCount - 1"
    :key="i"
    x1="0" :x2="width"
    :y1="(i + 1) * rowHeight"
    :y2="(i + 1) * rowHeight"
    stroke="#CCCCCC"
    stroke-dasharray="4 2"
    />
</g>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import {ProcessedScheduleData} from '@/store/trips'
import {Team} from '@/lib/types'

export default Vue.extend({
  props: {
    rowHeight: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    }
  },
  computed: {
    teamSchedules (): [Team, ProcessedScheduleData][] {
      return this.$store.getters['trips/teamSchedules']
    }
  }
})
</script>


<template>
  <line
    y1="0" :y2="height"
    :x1="(time / 3600e3) * columnWidth"
    :x2="(time / 3600e3) * columnWidth"
    stroke="#FF0000"
    stroke-width="2"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import _ from 'lodash'

export default Vue.extend({
  computed: {
    time(): number {
      const d = new Date((store.state as any).time.time)
      const e = new Date((store.state as any).time.time)
      d.setHours(0, 0, 0)
      return e.getTime() - d.getTime()
    }
  },
  props: {
    columnWidth: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    }
  },
})
</script>


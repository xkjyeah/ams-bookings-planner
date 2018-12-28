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
import _ from 'lodash'

export default Vue.extend({
  data () {
    const d = new Date
    const e = new Date
    d.setHours(0, 0, 0)
    return {
      time: e.getTime() - d.getTime()
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


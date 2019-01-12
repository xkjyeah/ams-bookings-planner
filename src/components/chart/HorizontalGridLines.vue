<template>
<g>
  <line v-for="i in range"
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

export default Vue.extend({
  props: {
    rowHeight: {
      type: Number,
      required: true,
    },
    n: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    }
  },
  computed: {
    range (): Array<Number> {
      return _.range(0, this.n)
    }
  }
})
</script>


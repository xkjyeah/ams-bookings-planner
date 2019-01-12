<template>
<g>
  <line v-for="i in range"
    :key="i"
    y1="0" :y2="height"
    :x1="(i + 1) * columnWidth"
    :x2="(i + 1) * columnWidth"
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
    columnWidth: {
      type: Number,
      required: true,
    },
    n: {
      type: Number,
      required: true,
    },
    height: {
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


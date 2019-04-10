<!--
A tooltip that hides upon mousedown, so that it doesn't interfere with
drag and drop.
-->
<template>
<v-tooltip
  v-bind="$attrs"
  v-on="$listeners"
  @mousedown.native="showTooltip = false"
  @mouseover.native="showTooltip = true"
  :value="showTooltip"
  >
  <slot slot="activator" name="activator" />
  <slot />
</v-tooltip>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      showTooltip: false,
    }
  }
})
</script>

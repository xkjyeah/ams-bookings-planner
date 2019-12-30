<!--
A tooltip that hides upon mousedown, so that it doesn't interfere with
drag and drop.
-->
<template>
<v-tooltip
  v-bind="$attrs"
  v-on="$listeners"
  @mousedown.native="showTooltip = false"
  @mouseover.native="showTooltipIfMouseNotDown"
  @drag.native="showTooltip = false"
  :value="showTooltip"
  content-class="unobstrustive-disable-mouse"
  >
  <slot slot="activator" name="activator" />
  <slot />
</v-tooltip>
</template>

<style>
.unobstrustive-disable-mouse {
  /* so that the underlying row and not the tooltip
  becomes the DND drop target */
  pointer-events: none;
}
</style>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      showTooltip: false,
    }
  },
  methods: {
    showTooltipIfMouseNotDown(e: MouseEvent) {
      if (!e.buttons) {
        this.showTooltip = true
      }
    }
  }
})
</script>

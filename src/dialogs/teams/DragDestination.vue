<template>
  <div
    @drop="draggedOver = false; $emit('drop', $event)"
    @dragover="handleDragOver"
    @dragleave="draggedOver = false"
    :class="{'dragged-over': draggedOver}"
  >
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.dragged-over {
  box-shadow: 0 0 5px #FF0;
}
</style>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: ['expectType'],

  data () {
    return {
      draggedOver: false,
    }
  },

  methods: {
    handleDragOver (event: DragEvent) {
      if (!event.dataTransfer) return
      if (event.dataTransfer.getData(this.expectType)) {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        this.draggedOver = true
      }
    }
  }
})
</script>



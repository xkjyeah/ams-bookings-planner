<template>
<div>
  <!-- Draggable stuff -->
  <transition-group name="team-list">
    <div v-for="(team_data, i) in teamSchedules"
      :key="`${team_data[0].driver}, ${team_data[0].medic}`"
      :style="{
        'text-align': 'right',
        left: '0',
        right: '0',
        height: (scale) + 'px',
        top: (scale * i) + 'px',
        position: 'absolute',
      }"
      class="team-marker"
      :class="{ 'is-dragged': dragIndex === i }"

      draggable
      @drop="onDrop($event, 1)"
      @dragend="onDragEnd($event, i)"
      @dragstart="onDragStart($event, i)"
      @dragover="onDragOver($event, i)"
      >
      {{team_data[0].driver}}, {{team_data[0].medic}}
    </div>
  </transition-group>

  <!-- placeholder -->
  <div v-if="isDragging"
    class="placeholder"
    :style="{
      top: (scale * destinationIndex) + 'px',
    }">
  </div>
</div>
</template>

<style lang="scss" scoped>
.placeholder {
  position: absolute;
  height: 0;
  width: 100%;
  border-top: solid 3px black;
}
.team-marker {
  transition: top 0.1s linear;
  &:hover {
    background-color: #CEF
  }
}
.is-dragged {
  opacity: 0.4;
}
</style>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    scale: {
      type: Number,
      required: true,
    },
    teamSchedules: {
      type: Array,
      required: true,
    }
  },
  data () {
    return {
      dragIndex: -1,
      isDragging: false,
      destinationIndex: 0,
    }
  },
  mounted () {
    for (let i of Array.from((this.$el as HTMLElement).children)) {
      i.dataset.test = Math.random()
    }
  },
  methods: {
    handleMove (options: any): void {
      this.destinationIndex = options.draggedContext.futureIndex
    },
    handleInput (v: any): void {
      this.$store.commit('trips/updateTeams', v)
    },

    onDragStart (e: DragEvent, index: number): void {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.dropEffect = "move"
      // Firefox insists on this to activate the drag
      e.dataTransfer.setData('text/my-drag', 'dummy');
      this.dragIndex = index
      this.isDragging = true
    },
    onDragEnd (e: DragEvent, index: number): void {
      if (this.destinationIndex < 0) return

      this.$store.commit('trips/reorderTeam', {
        oldIndex: this.dragIndex,
        newIndex: this.destinationIndex
      })

      this.isDragging = false
      this.dragIndex = -1
    },
    onDragOver (e: DragEvent, index: number): boolean {
      if (!e.dataTransfer.types.includes('text/my-drag')) {
        return
      }
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      this.isDragging = true
      this.destinationIndex =
        (index < this.dragIndex) ? index
        : (index === this.dragIndex) ? -1
        : (index + 1)
      return false
    },
    onDrop (e: DragEvent, index: number) {
      e.preventDefault()
    }
  }
})
</script>


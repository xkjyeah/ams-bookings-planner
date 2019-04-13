<template>
<div>
  <!-- Draggable stuff -->
  <transition-group name="team-list">
    <div v-for="([team, data], i) in teamSchedules"
      :key="`${team.driver},${team.medic},${data.row}`"
      :style="{
        'text-align': 'right',
        left: '0',
        right: '0',
        height: (scale) + 'px',
        top: (scale * i) + 'px',
        position: 'absolute',
        'user-select': 'none',
      }"
      class="team-marker"
      :class="{ 'is-dragged': dragIndex === i }"

      draggable
      @drop="onDrop($event, 1)"
      @dragstart="onDragStart($event, i)"
      @dragover="onDragOver($event, i)"
      >
      <template v-if="team.driver || team.medic">
        {{team.driver}}, {{team.medic}}
      </template>
      <template v-else>
        <em class="not-assigned">Not assigned</em>
      </template>
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
.not-assigned {
  color: #CCC;
}
</style>


<script lang="ts">
import Vue from 'vue'

interface TeamListData {
  dragIndex: number,
  isDragging: boolean,
  destinationIndex: number,
}

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
  data (): TeamListData {
    return {
      dragIndex: -1,
      isDragging: false,
      destinationIndex: 0,
    }
  },
  methods: {
    handleMove (options: any): void {
      this.$data.destinationIndex = options.draggedContext.futureIndex
    },
    handleInput (v: any): void {
      this.$store.commit('trips/updateTeams', v)
    },

    onDragStart (e: DragEvent, index: number): void {
      if (!e.dataTransfer) throw new Error('Unexpected null dataTransfer')

      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.dropEffect = "move"
      // Firefox insists on this to activate the drag
      e.dataTransfer.setData('text/team-reorder-drag', 'dummy')
      ;(this as any as TeamListData).dragIndex = index
      ;(this as any as TeamListData).isDragging = true
    },
    onDragEnd (e: DragEvent, index: number): void {
      if ((this as any as TeamListData).destinationIndex < 0) return

      this.$store.commit('trips/reorderTeam', {
        oldIndex: (this as any as TeamListData).dragIndex,
        newIndex: (this as any as TeamListData).destinationIndex
      })

      ;(this as any as TeamListData).isDragging = false
      ;(this as any as TeamListData).dragIndex = -1
    },
    onDragOver (e: DragEvent, index: number): boolean {
      if (!e.dataTransfer) throw new Error('Unexpected null dataTransfer')

      if (!e.dataTransfer.types.includes('text/team-reorder-drag')) {
        return true
      }
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      ;(this as any as TeamListData).isDragging = true
      ;(this as any as TeamListData).destinationIndex =
        (index < (this as any as TeamListData).dragIndex) ? index
        : (index === (this as any as TeamListData).dragIndex) ? -1
        : (index + 1)
      return false
    },
    onDrop (e: DragEvent, index: number) {
      e.preventDefault()

      if (!e.dataTransfer!.types.includes('text/team-reorder-drag')) {
        return true
      }

      if ((this as any as TeamListData).destinationIndex < 0) return

      this.$store.commit('trips/reorderTeam', {
        oldIndex: this.$store.getters['trips/teamIndexForRow']((this as any as TeamListData).dragIndex),
        newIndex: this.$store.getters['trips/teamIndexForRow']((this as any as TeamListData).destinationIndex)
      })

      ;(this as any as TeamListData).isDragging = false
      ;(this as any as TeamListData).dragIndex = -1
    }
  }
})
</script>


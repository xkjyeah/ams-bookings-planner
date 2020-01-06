<template>
  <div class="planner-chart"
    :style="{
      'grid-template-columns': `${yAxisWidth}px 1fr`,
      'grid-template-rows': `${xAxisHeight}px 1fr`,
    }"
    @dragover="onDragOver($event)"
    @drop="onDrop($event)"
    @dragleave="onDragLeave($event)"
    >

    <!-- include the content -->
    <div class="y-axis">
      <slot name="y-axis" :scale="yAxisScale"></slot>
    </div>

    <div class="x-axis">
      <slot name="x-axis" :scale="xAxisScale"></slot>
    </div>

    <div class="content" ref="scrollRef">
      <!-- create the background SVGs -->
      <slot name="background-svg"
        :xScale="xAxisScale"
        :yScale="yAxisScale"
        :xAxisHeight="xAxisHeight"
        :yAxisWidth="yAxisWidth">
      </slot>

      <slot :xScale="xAxisScale" :yScale="yAxisScale" />
    </div>

    <div
      v-if="drag.row >= 0"
      style="border: dashed 2px rgba(0, 0, 0, 0.5); position: absolute; z-index: 10; pointer-events: none"
      :style="{
        top: (drag.row * yAxisScale + xAxisHeight) + 'px',
        height: yAxisScale + 'px',
        left: (drag.start / 3600e3 * xAxisScale + yAxisWidth) + 'px',
        width: ((drag.end - drag.start) / 3600e3 * xAxisScale) + 'px',
      }"
      >
    </div>

    <div
      v-if="drag.row >= 0"
      style="background-color: #DDD; position: absolute; pointer-events: none"
      :style="{
        top: (drag.row * yAxisScale + xAxisHeight) + 'px',
        height: yAxisScale + 'px',
        left: yAxisWidth + 'px',
        width: (24 * xAxisScale) + 'px',
      }"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.planner-chart {
  overflow-x: auto;
  display: grid;

  .y-axis {
    background-color: rgba(255, 255, 255, 0.9);
    position: sticky;
    left: 0;
    grid-column: 1;
    grid-row: 2;
    overflow: hidden; // fixme: need to deal with offsets from content
    z-index: 3;
  }

  .x-axis {
    background-color: rgba(255, 255, 255, 0.9);
    grid-column: 2;
    grid-row: 1;
    top: 0;
    position: sticky;
    overflow: hidden; // fixme: need to deal with offsets from content
    z-index: 3;
  }

  .content {
    grid-column: 2;
    grid-row: 2;
    position: relative;
  }
}
</style>

<script lang="ts">
import Vue from 'vue'
import { KeyableTrip, imputedEndTime } from '@/lib/types';
import store from '@/store';
import * as tripReassignment from './tripReassignment'
import { TripsState } from '../../store/trips';

export default Vue.extend({
  data () {
    return {
      scrollLeft: 0,
      scrollTop: 0,

      drag: {
        row: -1,
        start: null,
        end: null,
        type: null as null | 'reassign' | 'retime',
      }
    }
  },

  props: {
    yAxisWidth: {
      type: Number,
      default: 150,
    },
    yAxisScale: {
      type: Number,
      default: 50,
    },
    xAxisHeight: {
      type: Number,
      default: 50,
    },
    xAxisScale: {
      type: Number,
      default: 50,
    },
    showTime: {
      type: Boolean,
      default: false,
    }
  },

  provide () {
    return {
      xScale: () => this.xAxisScale,
      yScale: () => this.yAxisScale,
    }
  },

  methods: {
    updateScrollOffsets () {
      this.scrollLeft = (this.$refs.contentElem as HTMLElement).scrollLeft
      this.scrollTop = (this.$refs.contentElem as HTMLElement).scrollTop
    },

    scrollTo (left: number, top: number) {
      this.scrollLeft = (this.$refs.contentElem as HTMLElement).scrollLeft = left
      this.scrollTop = (this.$refs.contentElem as HTMLElement).scrollTop = top
    },

    onDragOver(event: DragEvent) {
      const data = tripReassignment.getData()
      if (!data) {
        return
      }
      event.preventDefault()
      event.dataTransfer!.dropEffect = 'move'

      const {start, end} = data

      const y = computeRelativeYPosition(event, this.$refs.scrollRef as Element)

      const canonicalOffsetForRow = this.$store.getters['trips/canonicalOffsetForRow'](Math.floor(y / this.yAxisScale))
      if (canonicalOffsetForRow === null) {
        event.dataTransfer!.dropEffect = 'none'
        this.drag.row = -1
        return
      }

      if (canonicalOffsetForRow !== data.originalRow) {
        // Show preview of destination team
        // Compute row, width
        this.drag.type = 'reassign'
        this.drag.row = canonicalOffsetForRow
        this.drag.start = start
        this.drag.end = end
      } else {
        // We want to re-time the job instead
        const x = computeRelativeXPosition(event, this.$refs.scrollRef as Element)
        // snap to nearest 15mins
        const draggedTime = this.xPositionToNearestTick(x - data.offsetX)

        // Show preview of destination time
        // Compute row, width
        this.drag.type = 'retime'
        this.drag.row = canonicalOffsetForRow
        this.drag.start = draggedTime
        this.drag.end = draggedTime + end - start
      }
    },

    xPositionToNearestTick (x: number) {
      return Math.round(x / this.xAxisScale * 12) / 12 * 3600e3
    },

    onDrop(event: DragEvent) {
      const data = tripReassignment.getData()
      if (!data) {
        return
      }
      const y = computeRelativeYPosition(event, this.$refs.scrollRef as Element)

      const {tripId, start, end} = data

      const row = Math.floor(y / this.yAxisScale)
      const tripToMove = (this.$store.state.trips as TripsState).trips[tripId]

      if (row !== data.originalRow) {
        const destinationTeam = this.$store.getters['trips/teamForRow'](row)
        const wantToEdit = this.$store.getters['tripEditing/tripBeingEdited'] === tripToMove

        this.$store.commit('trips/reassignJob', {
          trip: tripToMove,
          team: destinationTeam,
        })
      } else {
        // We want to re-time the job instead
        const x = computeRelativeXPosition(event, this.$refs.scrollRef as Element)
        // snap to nearest 15mins
        const draggedTime = this.xPositionToNearestTick(x - data.offsetX)
        const newStartTime = draggedTime
        const newEndTime = draggedTime + end - start

        this.$store.commit('trips/updateTrip', {
          tripId: tripToMove.id,
          updates: {
            startTime: newStartTime,
            newEndTime: tripToMove.endTime === null ? null : newEndTime
          }
        })
      }

      this.drag.row = -1 // Disable the placeholder now
      event.preventDefault()
    },

    onDragLeave(event: DragEvent) {
      event.preventDefault()
    }
  }
})

function computeRelativeXPosition(event: MouseEvent, rootElement: Element) {
  let x = event.offsetX
  let node = event.target as Element

  x += node.getBoundingClientRect().left -
    rootElement.getBoundingClientRect().left

  return x
}

function computeRelativeYPosition(event: MouseEvent, rootElement: Element) {
  let y = event.offsetY
  let node = event.target as Element

  y += node.getBoundingClientRect().top -
    rootElement.getBoundingClientRect().top

  return y
}

</script>
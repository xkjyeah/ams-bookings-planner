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

    <div class="drag" v-if="drag.row > 0">
      <slot name="drag-placeholder"
        :xScale="xAxisScale"
        :yScale="yAxisScale"
        :xAxisHeight="xAxisHeight"
        :yAxisWidth="yAxisWidth">
        <div
          style="border: dashed 2px rgba(0, 0, 0, 0.5); position: absolute; z-index: 999"
          :style="{
            top: (drag.row * yAxisScale + xAxisHeight) + 'px',
            height: yAxisScale + 'px',
            left: (drag.start / 3600e3 * xAxisScale + yAxisWidth) + 'px',
            width: ((drag.end - drag.start) / 3600e3 * xAxisScale) + 'px',
          }">
        </div>
      </slot>
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
import { KeyableTrip } from '@/lib/types';

export default Vue.extend({
  data () {
    return {
      scrollLeft: 0,
      scrollTop: 0,

      drag: {
        row: -1,
        start: null,
        end: null,
      }
    }
  },

  props: {
    yAxisWidth: {
      type: Number,
      default: 100,
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
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      const data = JSON.parse(event.dataTransfer.getData('application/json'))
      const {start, end} = data

      const y = computeRelativeYPosition(event, this.$refs.scrollRef)

      // Show preview of destination
      // Compute row, width
      this.drag.row = Math.floor(y / this.yAxisScale)
      this.drag.start = start
      this.drag.end = end
    },

    onDrop(event: DragEvent) {
      const y = computeRelativeYPosition(event, this.$refs.scrollRef)

      const data = JSON.parse(event.dataTransfer.getData('application/json'))
      const {key, tripIndex} = data

      const row = Math.floor(y / this.yAxisScale)

      this.$store.commit('trips/reassignJob', {
        trip: this.$store.state.trips.scheduleByTeam[key].trips[tripIndex],
        team: this.$store.state.trips.teams[row],
      })

      this.drag.row = -1 // Disable the placeholder now

      event.preventDefault()
    },

    onDragLeave(event: DragEvent) {
      this.drag.row = -1
      event.preventDefault()
    }
  }
})

function computeRelativeYPosition(event: MouseEvent, rootElement: Element) {
  let y = event.offsetY
  let node = event.target as Element

  y += node.getBoundingClientRect().top -
    rootElement.getBoundingClientRect().top

  return y
}

</script>
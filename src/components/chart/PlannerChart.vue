<template>
  <div class="planner-chart"
    :style="{
      'grid-template-columns': `${yAxisWidth}px 1fr`,
      'grid-template-rows': `${xAxisHeight}px 1fr`,
    }"
    >

    <!-- include the content -->
    <div class="y-axis">
      <slot name="y-axis" :scale="yAxisScale"></slot>
    </div>

    <div class="x-axis">
      <slot name="x-axis" :scale="xAxisScale"></slot>
    </div>

    <div class="content">
      <!-- create the background SVGs -->
      <slot name="background-svg"
        :xScale="xAxisScale"
        :yScale="yAxisScale"
        :xAxisHeight="xAxisHeight"
        :yAxisWidth="yAxisWidth">
      </slot>

      <slot :xScale="xAxisScale" :yScale="yAxisScale" />
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
    z-index: 99;
  }

  .x-axis {
    background-color: rgba(255, 255, 255, 0.9);
    grid-column: 2;
    grid-row: 1;
    top: 0;
    position: sticky;
    overflow: hidden; // fixme: need to deal with offsets from content
    z-index: 99;
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

export default Vue.extend({
  data () {
    return {
      scrollLeft: 0,
      scrollTop: 0,
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
    }
  }
})

</script>
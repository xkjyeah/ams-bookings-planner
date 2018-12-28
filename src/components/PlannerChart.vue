<template>
  <div class="planner-chart">

    <!-- include the content -->

    <div class="y-axis" :style="{
      width: yAxisWidth + 'px',
      top: (xAxisHeight - scrollTop) + 'px',
    }">
      <slot name="y-axis" :scale="yAxisScale"></slot>
    </div>

    <div class="x-axis" :style="{
      left: (yAxisWidth - scrollLeft) + 'px',
      height: xAxisHeight + 'px',
    }">
      <slot name="x-axis" :scale="xAxisScale"></slot>
    </div>

    <div class="content" :style="{
      left: yAxisWidth + 'px',
      top: xAxisHeight + 'px',
    }"
      ref="contentElem"
      @scroll="updateScrollOffsets">

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
  .y-axis {
    position: absolute;
    left: 0;
    bottom: 0;
    overflow: hidden; // fixme: need to deal with offsets from content
  }

  .x-axis {
    position: absolute;
    top: 0;
    right: 0;
    overflow: hidden; // fixme: need to deal with offsets from content
  }

  .content {
    position: absolute;
    overflow: auto;
    bottom: 0;
    right: 0;
  }
}
</style>

<script lang="ts">

export default {
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
}

</script>
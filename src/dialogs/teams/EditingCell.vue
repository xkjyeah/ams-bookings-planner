<template>
  <div v-if="!isEditing" @focus="handleFocus()"
    @click.prevent="handleFocus()" tabindex="0"
    :class="{disabled}">
    <slot />
  </div>
  <div v-else ref="editorDiv" class="editor-div">
    <slot name="editor" :blur="blur" />
  </div>
</template>
<style lang="scss" scoped>
.editor-div {
  display: flex;
  & > * {
    flex: 1 1 auto;
    margin: 0;
    padding: 0;
    align-items: stretch;
  }
}

.disabled {
  color: #888;
}

</style>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      isEditing: false,
    }
  },
  watch: {
    isEditing (v) {
      this.$nextTick(() => {
        const el = (this.$refs.editorDiv as HTMLElement)
        const focusable = el && el.querySelector('input, a, select')

        if (!focusable) return

        if (v) {
          setTimeout(() => (focusable as HTMLInputElement).select(), 1)
        }
      })
    }
  },
  methods: {
    blur () {
      this.$nextTick(() => {
        this.isEditing = false;
      })
    },
    handleFocus () {
      if (!this.disabled) {
        this.isEditing = true
      }
    }
  }
})
</script>


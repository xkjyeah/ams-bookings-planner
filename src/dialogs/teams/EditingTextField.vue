<template>
  <input
    ref="myinput"
    v-bind="$attrs"
    @input="$emit('input', $event.target.value)"
    @change="$emit('change', $event.target.value)"
    v-on="unhandledListeners"
  />
</template>
<style lang="scss" scoped>
input {
  display: block;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  border: solid 1px red;
}
</style>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    unhandledListeners(): any {
      const {change, input, ...rest} = this.$listeners
      return rest
    }
  }
})
</script>


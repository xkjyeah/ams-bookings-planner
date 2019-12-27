<template>
<v-input
    v-bind="_.omit($attrs, ['value'])"
>
  <input
    type="tel"
    :value="convertFromTime(value)"
    @change="$emit('input', convertToTime($event.target.value))"
    v-on="_.omit($listeners, ['input', 'change'])"
    style="width: 5em"
    />
</v-input>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'

const TIME_REGEX = /^([0-9]?[0-9]):?([0-9][0-9])$/

export default Vue.extend({
  props: ['value'],

  computed: {
    _: () => _
  },

  methods: {
    convertFromTime (value: number | null) {
      if (value === null) return ''

      const hours = parseInt((value / 3600e3).toString()).toString().padStart(2, ' ')
      const minutes = parseInt((value % 3600e3 / 60e3).toString()).toString().padStart(2, '0')

      return `${hours}:${minutes}`
    },

    convertToTime (value: string) {
      const matches = value.match(TIME_REGEX)

      if (!matches) return null

      return parseInt(matches[1], 10) * 3600e3 +
        parseInt(matches[2], 10) * 60e3
    }
  }
})
</script>


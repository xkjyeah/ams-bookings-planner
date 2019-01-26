<template>
<v-input
    v-bind="_.omit($attrs, ['value'])"
>
  <span>
    <input
      type="tel"
      ref="inp"
      :value="convertFromDate(value)"
      @change="$emit('input', convertToDate($event.target.value))"
      v-on="_.omit($listeners, ['input', 'change'])"
      />
    ({{ dayOfWeek }})
  </span>
</v-input>
</template>
<style scoped>
input {
  text-align: right;
}
</style>


<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import dateformat from 'dateformat'

const DATE_REGEX = /^([0-9]{1,2})[-\./ ]([0-9]{1,2})[-\./ ]([0-9]{2,4})$/

export default Vue.extend({
  props: ['value'],

  computed: {
    _: () => _,

    dayOfWeek () {
      if (this.value)
        return dateformat(this.value, 'UTC:dddd')
    }
  },

  methods: {
    convertFromDate (value: number | null) {
      if (value === null) return ''

      return dateformat(value, 'UTC:dd-mm-yyyy')
    },

    revertValue () {
      (this.$refs.inp as HTMLInputElement).value = this.convertFromDate(this.value)
    },

    convertToDate (value: string) {
      const matches = value.match(DATE_REGEX)

      if (!matches) return this.revertValue()

      let [_unused, day, month, year] = new Array(...matches).map(s => parseInt(s))

      if (year < 100) year += 2000

      const newValue = Date.UTC(year, month - 1, day)

      if (newValue === this.value) {
        this.revertValue()
      }
      return newValue
    }
  }
})
</script>


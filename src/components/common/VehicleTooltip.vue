<template>
  <v-tooltip
    v-bind="$attrs"
    v-on="$listeners"
    content-class="unobstrustive-disable-mouse"
    >
    <slot slot="activator" />
    <div>
      <div>
        <b>{{value.registrationNumber}}</b>
      </div>
      <div>
        <i>Status</i>
        {{value.vehicleStatus}}
      </div>
      <div>
        <i>Location</i>
        {{value.location}}
      </div>
      <div>
        {{sAgo(value.created)}}
      </div>
    </div>
  </v-tooltip>
</template>
<script lang="ts">
import Vue from 'vue'
import sAgo from 's-ago'

export default Vue.extend({
  props: {value: {}},
  computed: {
    sAgo: () => (d: any) => sAgo(new Date(d))
  }
})
</script>

<template>
  <v-dialog
    :value="$store.state.dialogs.activeDialog === name"
    @input="handleDialogInput"
    scrollable
    >
    <v-card>
      <v-card-title>
        <v-layout>
          <h2>{{title}}</h2>
          <v-spacer />
          <v-btn small icon @click="handleDialogInput">
            <v-icon>close</v-icon>
          </v-btn>
        </v-layout>
      </v-card-title>
      <v-card-text :style="height ? {height} : {}">
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    name: {type: String, required: true},
    title: {type: String, required: false},
    height: {type: String, required: false},
  },

  methods: {
    handleDialogInput () {
      this.$store.commit('dialogs/hideDialog')
    },
  }
})
</script>


<template>
<span class="message-status-checker">
  <template v-if="status === 'unsent'">
    &mldr;
  </template>
  <template v-else-if="status === 'sent'">
    &check;
  </template>
  <template v-else>
    ?
  </template>
</span>
</template>
<style lang="scss" scoped>
.message-status-checker {
  color: #888;
}
</style>

<script lang="ts">
import Vue from 'vue'
import {db} from '@/lib/firebase';

export default Vue.extend({
  props: ['status', 'id'],

  data () {
    return {
      unwatch: null as (() => void) | null,
    }
  },

  computed: {
    isWatching (): boolean {
      return this.status === 'unsent'
    }
  },

  watch: {
    isWatching: {
      immediate: true,
      handler() {
        if (this.isWatching) {
          this.unwatch && this.unwatch()
          this.watch()
        } else {
          this.unwatch && this.unwatch()
        }
      }
    }
  },

  methods: {
    watch () {
      const callback = (v: firebase.database.DataSnapshot | null) => {
        if (v) {
          this.$emit('updated', v.val())
        }
      }
      db.ref(`/sms/${this.id}/status`).on('value', callback)
      this.unwatch = () => {
        this.unwatch = null
        db.ref(`/sms/${this.id}/status`).off('value', callback)
      }
    },
  },
})
</script>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  mounted () {
    const interval = setInterval(
      () => (this as any).$store.commit('time/updateTime'),
      60000
    )

    this.$on('hook:beforeDestroy', () => {
      clearInterval(interval)
    })
  }
})
</script>

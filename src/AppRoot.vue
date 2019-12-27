<template>
  <v-app class="app">
    <RequiresLogin>
      <App />
    </RequiresLogin>
  </v-app>
</template>

<script lang="ts">
import App from '@/App.vue'
import RequiresLogin from '@/RequiresLogin.vue'
import Vue from 'vue';

export default Vue.extend({
  components: {
    App, RequiresLogin
  }
});
</script>

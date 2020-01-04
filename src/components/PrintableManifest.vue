<template>
  <div class="print-area">
    <ManifestComponent :showHiddenTrips="false" />
  </div>
</template>
<style lang="scss">
@media screen {
  .print-area {
    display: none;
  }
  .hidden-in-print {
  }
}
@media print {
  .print-area {
    display: block;
  }
  .hidden-in-print, .hidden-in-print * {
    display: none !important;
  }
  .v-tooltip__content, .v-tooltip__content * {
    display: none !important;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import store from '@/store'
import ManifestComponent from '@/components/Manifest.vue';
import dateformat from 'dateformat';
import { db } from '@/lib/firebase';
import _ from 'lodash';

export default Vue.extend({
  components: {
    ManifestComponent,
  },
})
</script>


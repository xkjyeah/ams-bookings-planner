<template>
<div class="sms-section">
  <h3>SMS to team</h3>
  <v-text-field
    :value="tripRecipientPhoneNumberRender"
    disabled
    />
  <v-text-field multi-line
    :label="messageLabel"
    :value="message"
    disabled
    auto-grow
  />
</div>
</template>
<style lang="scss">
.sms-section {
  border: solid 1px black;
  border-radius: 0.2em;
  padding: 0.2em;
}
</style>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({

})
</script>


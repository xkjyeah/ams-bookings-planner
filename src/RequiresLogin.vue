<template>
  <div v-if="isLoggedIn">
    <slot />
  </div>
  <div v-else-if="errorReading === null" class="not-logged-in">
    <!-- we've not tested anything, just spin -->
    <div>Loading...</div>
  </div>
  <div v-else class="not-logged-in">
    <div>
      <h1>Welcome to AMS Bookings Planner</h1>
      <v-alert v-if="loggedInUser && errorReading" :value="true" type="error">
        You are not authorized to access AMS Bookings Planner
      </v-alert>
      <v-btn @click="signInGoogle" color="primary">
        Sign In with Google
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-logged-in {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  div {
    flex: 0 0 auto;
    text-align: center;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import { readTrips } from './store/trips';
import {auth} from '@/lib/firebase'
import firebase from 'firebase'

export default Vue.extend({
  data () {
    return {
      errorReading: null as boolean | null,
    }
  },

  computed: {
    loggedInUser(): string {
      return this.$store.state.login.user
    },
    isLoggedIn(): Boolean {
      return !!(!this.errorReading && this.loggedInUser)
    }
  },

  watch: {
    loggedInUser() {
      this.testAuth()
    }
  },

  mounted () {
    const unsubscribe = auth.onAuthStateChanged((user: firebase.User | null) => {
      this.$store.commit('login/updateUser', user && user.email)
    })
    this.$on('destroyed', () => unsubscribe())
    this.testAuth()
  },

  methods: {
    testAuth () {
      // Try to read something -- if it succeeds, then we're
      // logged in!
      readTrips(this.$store.state.trips.mode)
      .then(() => {
        this.errorReading = false
      })
      .catch(() => {
        this.errorReading = true
      })
    },

    signInGoogle () {
      const provider = new firebase.auth.GoogleAuthProvider()
      provider.addScope('email')
      this.$store.dispatch('login/signInWithPopup', provider)
    }
  }
});
</script>

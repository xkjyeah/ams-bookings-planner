<template>
  <div class="app">
    <div class="search-results">
      <div v-if="unknownAuth" class="not-logged-in">
        <div>Loading...</div>
      </div>

      <div v-else-if="notLoggedIn" class="not-logged-in">
        <button @click="login">Log in</button>
      </div>

      <div v-else
          class="search-list"
          @click="viewingMap = false"
          :class="{
            'viewing-map': viewingMap,
            }">
        <!-- {{vehicles}} -->
        <table class="the-table">
          <tbody>
            <tr v-for="(v, i) in vehicles" :key="v.registrationNumber">
              <td style="width: 6.5em">
                {{v.registrationNumber}}<br/>
                <span class="vehicle-status">({{v.vehicleStatus}})</span>
              </td>
              <td class="location">
                <a href="#"
                  @click.prevent.stop="showOnMap(v)"
                  >
                  {{v.location}}
                  <br/>
                  {{v.created && sAgo(v.created)}}
                </a>
              </td>
              <td>
                {{v.speed}}km/h
                <!-- Dir {{v.direction}} -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <gmap-map class="search-map" :center="mapCenter" :zoom="mapZoom"
        ref="searchMap" @zoom_changed="mapZoom = $event" :options="mapOptions">
        <gmap-marker :position="mapCenter" />
        <gmap-marker
          v-for="(v, i) in vehicles"
          :position="{lat: v.lat, lng: v.lng}"
          :key="v.registrationNumber"
        />
      </gmap-map>
    </div>
  </div>
</template>

<style lang="scss">

* {
  font-family: Calibri, sans-serif;
  font-size: 12px;
}

body {
  background-color: #DDDDDD;
}

.app {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;

  max-width: 400px;
  width: 100%;
  margin: 0 auto;

  .search-results {
    flex: 1 1 auto;
    position: relative;
    overflow-x: hidden;

    .search-map, .search-list, .not-logged-in {
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
    }

    .not-logged-in {
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .search-list {
      overflow-y: auto;
      box-shadow: 0 0 1em rgba(0,0,0,0.5);
      z-index: 1000;
      background-color: rgba(240, 240, 240, 0.9);
      transform: translateX(0);
      transition: all 0.1s ease;

      &.viewing-map {
        transform: translateX(calc(100% - 3em));
      }

      .the-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em auto;

        th,td {
          border: solid 1px #CCC;
        }
        .location a {
          text-decoration: none;
        }
        .vehicle-status {
          color: #666;
          font-size: 80%;
        }
      }
    }
  }
}
</style>

<script>
import _ from 'lodash'
import querystring from 'querystring'
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'
import sAgo from 's-ago';

const config = {
  apiKey: "AIzaSyD13f_m0clyvTunsWRoyvhmBF1r5Lrqt4w",
  authDomain: "ams-bookings-planner.firebaseapp.com",
  databaseURL: "https://ams-bookings-planner.firebaseio.com",
  projectId: "ams-bookings-planner",
  storageBucket: "ams-bookings-planner.appspot.com",
  messagingSenderId: "553699052004"
}
firebase.initializeApp(config)

const auth = firebase.auth()
const db = firebase.database()

export default {
  name: 'app',
  data () {
    return {
      authState: null,
      searchQuery: '',
      selected: null,
      searchResults: [],
      mapCenter: {lat:1.38, lng:103.8},
      mapZoom: 14,
      inFlight: false,
      viewingMap: false,
      mapOptions: {
        mapTypeControl: false,
      },
      vehicles: [],
    }
  },
  computed: {
    sAgo: () => (timestamp) => sAgo(new Date(timestamp)),
    unknownAuth () {
      return this.authState === null
    },
    notLoggedIn () {
      return this.authState === false
    },

    gmapsHref () {
      return `https://www.google.com/maps/search/?api=1&query=${this.mapCenter.lat},${this.mapCenter.lng}`
    },
    validQuery () {
      return this.searchQuery.length === 6 || !/^[0-9]+$/.test(this.searchQuery)
    }
  },
  created() {
    auth.onAuthStateChanged((user) => {
      this.testAuth()
    })
  },
  mounted() {
    // Check if firebase is authenticated
    db.ref('/vehicles')
      .on('value', (e) => {
        if (!e) return
        this.handleIncomingSnapshot(e)
      })
  },
  methods: {
    handleIncomingSnapshot(snapshot) {
      if (!snapshot) return

      const re = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/
      const parseDate = (s) => {
        const parts = s.match(re)
        if (!parts) return null
        return new Date(
          parseInt(parts[1]),
          parseInt(parts[2]) - 1,
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5]),
          parseInt(parts[6]),
        ).getTime()
      }

      const value = snapshot.val()
      const vehicles = _.values(value)
        .map((v)  => ({
          created: parseDate(v.created) || 0,
          direction: parseInt(v.direction),
          registrationNumber: v.registrationNumber,
          speed: parseInt(v.speed),
          lat: parseFloat(v.lat),
          lng: parseFloat(v.lng),
          location: v.location,
          vehicleStatus: v.vehicleStatus,
        }))
      this.vehicles = vehicles
    },
    testAuth () {
      // Try to read something -- if it succeeds, then we're
      // logged in!
      db.ref('/vehicles')
      .once('value')
      .then((snapshot) => {
        this.authState = true
        this.handleIncomingSnapshot(snapshot)
      }, () => {
        this.authState = false
      })
    },
    login() {
      const provider = new firebase.auth.GoogleAuthProvider()
      provider.addScope('email')
      auth.signInWithPopup(provider)
    },

    showOnMap (vehicle) {
      this.mapCenter = {
        lat: parseFloat(vehicle.lat),
        lng: parseFloat(vehicle.lng)
      };

      this.$refs.searchMap.panTo(this.mapCenter)
      this.mapZoom = 18
      this.viewingMap = true
      this.selected = vehicle
    }
  }
}
</script>

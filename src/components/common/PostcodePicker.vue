<template>
  <v-text-field
    :label="label"
    :value="value"
    @blur="maybeEmitPostcode"
    @input="$emit('input', $event), updateQuery()"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
// import axios from 'axios'
import querystring from 'querystring'
import Vault from '@/vault'
import singaporeColors,{ LatLng } from '@/lib/singaporeColors'

/**
 * This takes in a structured object for a location --:
 * {
 *  query:,
 *  address:,
 *  latLng:,
 * }
 *
 * It returns the same object schema for the `input` event.
 */
export default Vue.extend({
  props: {
    value: {
      type: String,
    },
    label: {
      type: String,
    },
  },

  data () {
    return {
      lastKnownPostcode: null,
    }
  },

  mounted() {
    // this.$autocompleteService = new google.maps.places.AutocompleteService()
    // this.$placesService = new google.maps.places.PlacesService(this.$refs.attribution)
  },

  methods: {
    updateQuery: _.debounce(function () {
      this.query = this.value || ''
      if (this.query) { // TODO: inject well-known locations, e.g. CGH, SGH, OV Balestier here
        this.triggerOneMapSearch()
      } else {
        this.$emit('address-found', {
          address: null,
          latLng: null,
        })
        this.lastKnownPostcode = null
      }
    }, 200),

    maybeEmitPostcode () {
      if (this.lastKnownPostcode && this.value !== this.lastKnownPostcode) {
        this.$emit('input', this.lastKnownPostcode)
      }
    },

    triggerOneMapSearch () {
      const promise = this.$oneMapPromise = fetch('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
        searchVal: this.query,
        returnGeom: 'Y',
        getAddrDetails: 'Y',
        pageNum: 1,
      }))
      .then(r => r.json())
      .then((result: any) => {
        if (promise !== this.$oneMapPromise) return

        if (result.results && result.results.length > 0) {
          this.$emit('address-found', {
            address: result.results[0].ADDRESS,
            latLng: {
              lat: parseFloat(result.results[0].LATITUDE),
              lng: parseFloat(result.results[0].LONGITUDE),
            },
          })
          this.lastKnownPostcode = result.results[0].POSTAL !== 'NIL'
            ? result.results[0].POSTAL
            : null
        } else {
          this.$emit('address-found', {
            address: '(not found)',
            latLng: null,
          })
          this.lastKnownPostcode = null
        }
      })
    },
  }
})
</script>

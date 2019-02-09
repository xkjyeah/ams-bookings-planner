<template>
  <v-text-field
    :label="label"
    :value="value"
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

  mounted() {
    // this.$autocompleteService = new google.maps.places.AutocompleteService()
    // this.$placesService = new google.maps.places.PlacesService(this.$refs.attribution)
  },

  methods: {
    updateQuery: _.debounce(function () {
      this.query = this.value || ''
      if (this.query.match(/^[0-9]{6}$/)) {
        this.triggerOneMapSearch()
      } else {
        this.$emit('address-found', {
          address: null,
          latLng: null,
        })
      }
    }, 200),

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
        } else {
          this.$emit('address-found', {
            address: '(not found)',
            latLng: null,
          })
        }
      })
    },
  }
})
</script>

<template>
  <v-text-field
    :label="label"
    :value="value"
    @blur="maybeEmitPostcode"
    @input="updateQuery"
    v-bind="$attrs"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
// import axios from 'axios'
import querystring from 'querystring'
import Vault from '@/vault'
import singaporeColors from '@/lib/singaporeColors'
import {LatLng} from '@/lib/types'

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
    updateQuery (value: string) {
      this.$emit('input', value)
      const $updateQueryDebounced = (this as any).$updateQueryDebounced || _.debounce(this.updateQueryImpl, 200)
      $updateQueryDebounced()
    },

    updateQueryImpl () {
      const query = this.value || ''
      if (query) { // TODO: inject well-known locations, e.g. CGH, SGH, OV Balestier here
        this.triggerOneMapSearch()
      } else {
        this.$emit('address-found', {
          address: null,
          latLng: null,
        })
        this.lastKnownPostcode = null
      }
    },

    maybeEmitPostcode () {
      if ((this as any).$updateQueryDebounced) {
        (this as any).$updateQueryDebounced.cancel()
      }
      this.triggerOneMapSearch().then(() => {
        if (this.lastKnownPostcode && this.value !== this.lastKnownPostcode) {
          this.$emit('input', this.lastKnownPostcode)
        }
      })
    },

    triggerOneMapSearch (): Promise<any> {
      const promise = (this as any).$oneMapPromise = fetch('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
        searchVal: this.value,
        returnGeom: 'Y',
        getAddrDetails: 'Y',
        pageNum: 1,
      }))
      .then(r => r.json())
      .then((result: any) => {
        if (promise !== (this as any).$oneMapPromise) return

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
      return promise
    },
  }
})
</script>

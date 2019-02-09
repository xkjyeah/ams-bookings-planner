<template>
  <v-autocomplete
    :value="value"
    :items="simulatedSearchResults"
    :item-text="itemToText"
    :item-value="itemToValue"
    style="border-width: 2px; border-style: solid; flex: 1 1 auto"
    :style="{'border-color': latLng && singaporeColors(latLng)}"
    :searchInput="query"
    :filter="filter"
    @input="selectInput($event)"
    @update:searchInput="updateQuery">
    <!-- <GmapAutocomplete
      @place_changed="updateLatLng('startLatLng', $event)"
      :options="{
        bounds: {north: 1.48, south: 1.2, east: 104.1, west: 102},
        strictBounds: true
      }"
      /> -->
  </v-autocomplete>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
// import axios from 'axios'
import querystring from 'querystring'
import uuid4 from 'uuid4'
import Vault from '@/vault'
import singaporeColors,{ LatLng } from '@/lib/singaporeColors'

interface PlacesAutocompleteValue {
  type: 'PLACE',
  value: string,
  text: string,
}
interface OneMapValue {
  type: 'POSTCODE',
  value: LatLng,
  text: string,
}
interface DescriptionValue {
  type: 'DESCRIPTION',
  value: null,
  text: string,
}
type AutocompleteValueType = PlacesAutocompleteValue | OneMapValue | DescriptionValue

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
      type: Object,
    },
    label: {
      type: String,
    },
  },

  data () {
    this.$sessionToken = null
    return {
      query: 'Singapore',
      searchResults: ([] as AutocompleteValueType[]),
      random: Math.random(),
    }
  },

  computed: {
    singaporeColors: () => singaporeColors,

    latLng() {
      return this.value && this.value.value
    },

    /* Always present the current value as an option,
        so that we can present the text correctly. However, we
        hide it using the filter */
    simulatedSearchResults () {
      return [this.value].concat(this.searchResults)
    }
  },

  mounted() {
    // this.$autocompleteService = new google.maps.places.AutocompleteService()
    // this.$placesService = new google.maps.places.PlacesService(this.$refs.attribution)
  },

  watch: {
    'value': {
      immediate: true,
      handler (v) {
        console.log('watch value:', v, this.random)
        this.query = v && v.text
      }
    },
  },

  methods: {
    updateQuery(s: string) {
      this.query = s
      if (!s) {
        if (this.searchResults.length > 0) {
          this.searchResults = []
        }
      } else if (s === this.value.text) {
        return
      } else if (s.match(/^[0-9]{3,6}$/)) {
        this.triggerOneMapSearch()
      } else {
        this.triggerSearch()
      }
    },

    triggerOneMapSearch: _.debounce(function () {
      const promise = this.$oneMapPromise = fetch('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
        searchVal: this.query,
        returnGeom: 'Y',
        getAddrDetails: 'Y',
        pageNum: 1,
      }))
      .then(r => r.json())
      .then((result: any) => {
        if (promise !== this.$oneMapPromise) return

        this.searchResults = result.results.map(r => {
          return <OneMapValue>{
            text: r.ADDRESS,
            value: {
              lat: parseFloat(r.LATITUDE),
              lng: parseFloat(r.LONGITUDE),
            },
            type: 'POSTCODE'
          }
        })
      })
    }, 200),

    triggerSearch () {
      console.log('triggerSearch', this.query, this.value.text)
      // Don't want to override the user's input
      if (this.query === this.simulatedSearchResults[0].text) {
        return
      } else {
        this.searchResults = [{
          type: 'DESCRIPTION',
          text: this.query,
          value: null,
        }]
      }
      // const requestId = this.$lastRequest = (this.$lastRequest || 0) + 1

      // this.$gmapApiPromiseLazy()
      // .then((google: any) => {
      //   this.$autocompleteService.getPlacePredictions(
      //     {
      //       bounds: {north: 1.48, south: 1.2, east: 104.1, west: 102},
      //       input: this.query,
      //       sessionToken: this.getSessionToken(),
      //     },
      //     (result: google.maps.places.AutocompletePrediction[]) => {
      //       if (requestId === this.$lastRequest) {
      //         this.searchResults = result.map(this.valueFromPlace)
      //       }
      //     }
      //   )
      // })
    },

    getSessionToken() {
      if (this.$sessionToken === null) {
        this.$sessionToken = new google.maps.places.AutocompleteSessionToken
      }
      return this.$sessionToken
    },

    selectInput(r: AutocompleteValueType) {
      if (r === this.value) return

      if (r.type === 'PLACE') {
        if (!this.$placesService) return
        this.$placesService.getDetails({
          fields: ['geometry.location'],
          placeId: r.value,
          sessionToken: this.$sessionToken,
        }, (p: google.maps.places.PlaceResult) => {
          console.log('emit place')
          this.$emit('input', {
            text: r.text,
            value: {
              lat: p.geometry.location.lat(),
              lng: p.geometry.location.lng(),
            },
            type: 'PLACE',
          })
          this.$sessionToken = null
        })
      } else if (r.type === 'DESCRIPTION') {
        this.$gmapApiPromiseLazy().then((google) => {
          const geocoder = new google.maps.Geocoder
          geocoder.geocode({
            address: r.text
          }, (results, status) => {
            if (results.length > 0) {
              console.log('emit descr', r.text, results)
              this.$emit('input', {
                text: r.text,
                value: {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
                }
              })
            } else {
              console.log('emit no descr', r.text)
              this.$emit('input', {
                text: r.text,
                value: null,
              })
            }
          })
        })
      } else if (r.type === 'POSTCODE') {
        console.log('emit postcode', r)
        this.$emit('input', r)
      }
    },

    valueFromPlace(p: google.maps.places.AutocompletePrediction): AutocompleteValueType {
      return {
        text: p.description,
        value: p.place_id,
        type: 'PLACE',
      }
    },

    filter(item: String, queryText: string, itemText: string) {
      if (item === this.value) return false

      return true
    },

    itemToValue(i: any) { return i },
    itemToText(i: any) { return i.text || '' },
  }
})
</script>

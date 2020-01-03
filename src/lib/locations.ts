import querystring from 'querystring'
import _ from 'lodash'

export const PRESET_LOCATIONS: {[key: string]: string} = {
  NTF: '609606',
  NTFGH: '609606',
  KTPH: '768828',
  SGH: '169608',
  CGH: '529889',
  TTSH: '308433',
  SKH: '544835',
  AH: '159964',
  NUH: '119073',
  IMH: '539747',
  KKH: '229899',
}

export interface AddressSearchResult {
  address: string,
  latLng: {lat: number, lng: number} | null,
  postalCode: string | null,
}

const oneMapResultsToAddressSearchResult = (result: any) => {
  if (result.results && result.results.length > 0) {
    const bestResult = _.minBy(
      result.results,
      // find shortest addresses (ideally should exclude the ATMs)
      // also try to exclude nil postal codes
      (r: any) => [r.POSTAL === 'NIL', r.ADDRESS.length]
    )
    return {
      address: (bestResult.ADDRESS as string)
        .toLowerCase()
        .replace(/(?:\b|^)[a-z]/g, s => s.toUpperCase()),
      latLng: {
        lat: parseFloat(bestResult.LATITUDE),
        lng: parseFloat(bestResult.LONGITUDE),
      },
      postalCode: bestResult.POSTAL !== 'NIL'
        ? (bestResult.POSTAL as string)
        : null,
    }
  } else {
    return null
  }
}

export function fakeOneMapSearch(query: string | null): Promise<AddressSearchResult | null> {
  if (!query) return Promise.resolve(null)
  const upperCaseQuery = query.toUpperCase()

  if (upperCaseQuery in PRESET_LOCATIONS) {
    return fetch('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
      searchVal: PRESET_LOCATIONS[upperCaseQuery], // search for the postal code!
      returnGeom: 'Y',
      getAddrDetails: 'Y',
      pageNum: 1,
    }))
      .then(r => r.json())
      .then((result: any) => oneMapResultsToAddressSearchResult(result))
      .then((result) => result && {
        ...result, // retain the old query for the latlng
        address: upperCaseQuery,
        postalCode: PRESET_LOCATIONS[upperCaseQuery],
      })
  } else {
    const actualQuery = fetch('https://developers.onemap.sg/commonapi/search?' + querystring.stringify({
      searchVal: query,
      returnGeom: 'Y',
      getAddrDetails: 'Y',
      pageNum: 1,
    }))
      .then(r => r.json())
      .then((result: any) => oneMapResultsToAddressSearchResult(result))

    return actualQuery
  }
}
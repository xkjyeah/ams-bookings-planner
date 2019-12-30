import querystring from 'querystring'

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
    return {
      address: (result.results[0].ADDRESS as string)
        .toLowerCase()
        .replace(/(?:\b|^)[a-z]/g, s => s.toUpperCase()),
      latLng: {
        lat: parseFloat(result.results[0].LATITUDE),
        lng: parseFloat(result.results[0].LONGITUDE),
      },
      postalCode: result.results[0].POSTAL !== 'NIL'
        ? (result.results[0].POSTAL as string)
        : null,
    }
  } else {
    return null
  }
}

export function fakeOneMapSearch(query: string): Promise<AddressSearchResult | null> {
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
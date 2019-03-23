// Some silly implementation that tries to allocate a color to every lat-lng.
import {LatLng} from '@/lib/types'

// These are rough boundaries. Actual lat-lngs can exceed these values
const MAX_LAT = 1.45
const MAX_LNG = 104.00
const MIN_LAT = 1.25
const MIN_LNG = 103.63

export default function getColor(latLng: LatLng) {
  const scaleAndClamp = (s: number) =>
    Math.round(Math.max(0, Math.min(255, s * 255.0)))
  const toHex = (s: number) => s.toString(16).padStart(2, '0')

  const red = scaleAndClamp((latLng.lat - MIN_LAT) / (MAX_LAT - MIN_LAT))
  const green = scaleAndClamp((latLng.lng - MIN_LNG) / (MAX_LNG - MIN_LNG))
  const blue = 255.0 - Math.max(red, green)

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}
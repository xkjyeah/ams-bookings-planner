
export interface KeyableTrip {
  driver: string | null,
  medic: string | null,
}

export interface LatLng {lat: number, lng: number}

export interface Trip {
  driver: string | null,
  medic: string | null,
  startTime: number,
  endTime: number | null,
  id: string,

  startPostcode: string | null,
  endPostcode: string | null,
  startAddress: string | null,
  endAddress: string | null,
  startLocation: string | null,
  endLocation: string | null,
  startLatLng: LatLng | null,
  endLatLng: LatLng | null,
}
export interface Job {
  trip: Trip,
  secondTrip: Trip | null,
  type: string,
  price: number | null,
  description: string,
  cancelled: boolean
}

export interface JobTrip extends Trip, Job {
}

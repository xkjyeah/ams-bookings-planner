
export interface KeyableTrip {
  driver: string | null,
  medic: string | null,
}

export interface Trip {
  driver: string | null,
  medic: string | null,
  startTime: number | null,
  endTime: number | null,
  id: string,
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

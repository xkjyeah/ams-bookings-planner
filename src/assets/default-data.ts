import { Job } from '@/lib/types';
import uniqueId from '@/lib/uniqueId';

function makeTimeOffset(hours = 0, minutes = 0, seconds = 0) {
  return hours * 3600e3 +
    minutes * 60e3 +
    seconds * 1e3
}

/*
[
  {
    "trip": {
      "driver": "ch",
      "medic": "kim",
      "startTime": 50400000,
      "endTime": 41400000
    },
    "secondTrip": null,
    "type": "Event",
    "price": null,
    "description": "River Hongbao @ Floating Platform",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "bd",
      "medic": "jamil",
      "startTime": 27000000,
      "endTime": 39600000
    },
    "secondTrip": null,
    "type": "Event",
    "price": 262.15,
    "description": "Cross country @ Chinese Garden, Darshini",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Yazid",
      "medic": "Mee",
      "startTime": 37800000,
      "endTime": 50400000
    },
    "secondTrip": null,
    "type": "Event",
    "price": 224.7,
    "description": "Luncheon Event @ Raffles City Convention Centre, Siti",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Kt",
      "medic": "No",
      "startTime": 28800000,
      "endTime": 64800000
    },
    "secondTrip": null,
    "type": "Event",
    "price": null,
    "description": "Explomo Event @ Outside Track 13, Claraence 91728765",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "ch",
      "medic": "kim",
      "startTime": 25200000,
      "endTime": 43200000
    },
    "secondTrip": null,
    "type": "Event",
    "price": 347.75,
    "description": "Cross country @ Bedok Reservoir Park, Stephanie 67841234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Ir",
      "medic": "Yati",
      "startTime": 46800000,
      "endTime": 57600000
    },
    "secondTrip": null,
    "type": "Event",
    "price": null,
    "description": "Volleyball @ Delta Sport Hall",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Sg",
      "medic": "Sur",
      "startTime": 28800000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Bd",
      "medic": "Jm",
      "startTime": 49500000,
      "endTime": null
    },
    "type": "OV",
    "price": 110,
    "description": "OV Sims L1 --> TTSH \"2A\" Pt JohnAw OWC",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Aug",
      "medic": "Had",
      "startTime": 34200000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Yas",
      "medic": "At",
      "startTime": 48600000,
      "endTime": null
    },
    "type": "2W",
    "price": 90,
    "description": "106 Pasir Ris St 12 #XX-XXX -> CGH, Stretcher, Need 02, MOM Azizah 91271234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Por",
      "medic": "Red",
      "startTime": 36900000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Por",
      "medic": "Red",
      "startTime": 45900000,
      "endTime": null
    },
    "type": "2W",
    "price": 90,
    "description": "686 Jurong West Ctrl #XX-XXX -> NCC, OWC, 96771234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Md",
      "medic": "Ct",
      "startTime": 39600000,
      "endTime": 46800000
    },
    "secondTrip": null,
    "type": "Event",
    "price": 171.2,
    "description": "Shooting @ Kampong Glam Café, Shaikh Ahmad 83721234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Por",
      "medic": "Red",
      "startTime": 34200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "Dis",
    "price": 50,
    "description": "SGH Wd 48-24-10 --> Assisi Hospice Pt Lee John SN Lante 63211234",
    "cancelled": true
  },
  {
    "trip": {
      "driver": "Yazid",
      "medic": "Mee",
      "startTime": 28800000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "LKH",
    "price": 80,
    "description": "LKH Main Blk L2 -> SGH, Pt Kim John, OWC, SN Jonathan 62871234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Hai",
      "medic": "Amm",
      "startTime": 36900000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Bd",
      "medic": "Jm",
      "startTime": 43800000,
      "endTime": null
    },
    "type": "2W",
    "price": 90,
    "description": "NTUC NH @ Jurong West -> NTFH Tower A73, OWC, 96171234 Brother will bring down Pt from NH",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Hai",
      "medic": "Amm",
      "startTime": 32400000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "Dis",
    "price": 50,
    "description": "SGH W57-10-1 -> Pacific NH Seetoh John",
    "cancelled": true
  },
  {
    "trip": {
      "driver": "BH",
      "medic": "VL",
      "startTime": 36000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "DC",
    "price": 60,
    "description": "263 Boon Lay Dr #XX-XXX --> SGH AE Mdm Loh 94228950",
    "cancelled": false
  },
  {
    "trip": {
      "driver": null,
      "medic": null,
      "startTime": 50400000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "OV",
    "price": 90,
    "description": "450 AMK Ave 10 #XX-XXX -> OV Balestier L5, Pt Tee John, OWC",
    "cancelled": true
  },
  {
    "trip": {
      "driver": "BH",
      "medic": "VL",
      "startTime": 49500000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Huq",
      "medic": "Haz",
      "startTime": 54000000,
      "endTime": null
    },
    "type": "2W",
    "price": 90,
    "description": "St Andrew @ Henderson L4-48 -> NUH Kent Ridge Wing, Pt Lau John, OWC, 97731234 / 96631234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Huq",
      "medic": "Haz",
      "startTime": 51300000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Huq",
      "medic": "Haz",
      "startTime": 64800000,
      "endTime": null
    },
    "type": "OV",
    "price": 90,
    "description": "OV Simei L6 -> NUH L3 Main Bld Heart Ctr Pt Suan John, MRSA Pt, Stretcher",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Yazid",
      "medic": "At",
      "startTime": 55800000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Bh",
      "medic": "Vl",
      "startTime": 66600000,
      "endTime": null
    },
    "type": "Ov",
    "price": 110,
    "description": "Ov Simei L3 -> CGH L2, Pt Tau John, OWC",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Sg",
      "medic": "Sur",
      "startTime": 50400000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Sg",
      "medic": "Sur",
      "startTime": 54000000,
      "endTime": null
    },
    "type": "OV",
    "price": 90,
    "description": "OV Biggin Hill 52B -> Sata Tampines, Pt Anwar John, Sn Abel, Stretcher, Wait around 20 - 30 mins",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Yaz",
      "medic": "At",
      "startTime": 48600000,
      "endTime": null
    },
    "secondTrip": {
      "driver": "Sg",
      "medic": "Sur",
      "startTime": 57600000,
      "endTime": null
    },
    "type": "OV",
    "price": 90,
    "description": "OV Simei L2 -> CGH B Main Bld L2, Pt Rokiah Jane, Stretcher, 94691234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Por",
      "medic": "Red",
      "startTime": 54000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "Dis",
    "price": 50,
    "description": "AMK CH L2 Wd1 West Wing Bed 1315 -> 269A Yishun St 22 #XX-XXX, Pt Lee John, Motorized WC, Need Lifter, SN Robbie 64501234, Collect cash from Wd",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 10200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "SGH",
    "price": 74.9,
    "description": "SGH Fever Ctr -> KKH A/E",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 24000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "DC",
    "price": 150,
    "description": "718 Jurong West St 71 #XX-XXX -> NUH A/E, 97941234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Ir",
      "medic": "Yati",
      "startTime": 33600000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "DC",
    "price": 100,
    "description": "113 AMK Ave 4 #XX-XXX -> TTSH A/E 92751234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Sg",
      "medic": "Sur",
      "startTime": 35160000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "1777",
    "price": 150,
    "description": "304 Hougang Ave 5 #XX-XXX -> TTSH A/E 98461234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Sg ",
      "medic": "Sur",
      "startTime": 46800000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "OV",
    "price": 45,
    "description": "Raffles Hosp L9 B966 -> OV Sims L3 R2 B12, Pt Pua John SXX247E, MRSA",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Huq",
      "medic": "Has",
      "startTime": 46800000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "OV",
    "price": 60,
    "description": "OV Simei L6 -> SGH A/E Pt Tang Jane",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Hai",
      "medic": "Amm",
      "startTime": 46800000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "SGH",
    "price": 48.15,
    "description": "SGH Obs r 10-5 -> AH-10-4-12 Pt Pok John",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Hai",
      "medic": "Amm",
      "startTime": 54000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "Dis",
    "price": 50,
    "description": "CGH Wd45-84 -> 165 Tampines St 12 #09-305, Pt Lim Jane 96651234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Bd",
      "medic": "Jm",
      "startTime": 52200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "OV",
    "price": 60,
    "description": "OV Sims L3 -> TTSH A/E Pt Lim John",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "BH",
      "medic": "Vl",
      "startTime": 52200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "DC",
    "price": 100,
    "description": "63 Circuit Road #10-281 -> SGH A/E 98621234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Gv",
      "medic": "Ct",
      "startTime": 55500000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "1777",
    "price": 170,
    "description": "642A Punggol Drive #XX-XXX -> TTSH A/E 98271234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 79200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "DC",
    "price": 150,
    "description": "121 BB West Ave #XX-XXX -> NTFH A/E 96261234",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 83400000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "Ov",
    "price": 100,
    "description": "OV Marsiling L3 -> KTPH A/E",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 1200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "SKH",
    "price": 160,
    "description": "SKH A/E -> SGH Wd 44",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 24000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "SGH",
    "price": 150,
    "description": "718 Jurong West St 71 -> NUH A/E",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "St",
      "medic": "Sh",
      "startTime": 10200000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "SGH",
    "price": 74.9,
    "description": "SGH -> KKH Pt Jan John",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Zid",
      "medic": "Mu",
      "startTime": 75600000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "St Luke",
    "price": 90,
    "description": "St Luke -> NUH A/E",
    "cancelled": false
  },
  {
    "trip": {
      "driver": "Mid",
      "medic": "Zim",
      "startTime": 72000000,
      "endTime": null
    },
    "secondTrip": null,
    "type": "KTPH",
    "price": 85.6,
    "description": "KTPH A/E -> SGH A/E IPT ID 21000",
    "cancelled": false
  }
]
*/

const JOBS = `
ch	kim			1400	1130			Event		River Hongbao @ Floating Platform
bd	jamil			730	1100			Event	262.15	Cross country @ Chinese Garden, Darshini
Yazid	Mee			1030	1400			Event	224.7	Luncheon Event @ Raffles City Convention Centre, Siti
Kt	No			800	1800			Event		Explomo Event @ Outside Track 13, Claraence 91728765
ch	kim			700	1200			Event	347.75	Cross country @ Bedok Reservoir Park, Stephanie 67841234
Ir	Yati			1300	1600			Event		Volleyball @ Delta Sport Hall
Sg	Sur	Bd	Jm	800		1345		OV	110	OV Sims L1 --> TTSH "2A" Pt JohnAw OWC
Aug	Had	Yas	At	930		1330		2W	90	106 Pasir Ris St 12 #XX-XXX -> CGH, Stretcher, Need 02, MOM Azizah 91271234
Por	Red	Por	Red	1015		1245		2W	90	686 Jurong West Ctrl #XX-XXX -> NCC, OWC, 96771234
Md	Ct			1100	1300			Event	171.2	Shooting @ Kampong Glam Café, Shaikh Ahmad 83721234
Por	Red			930				Dis	50	SGH Wd 48-24-10 --> Assisi Hospice Pt Lee John SN Lante 63211234	Cancelled
Yazid	Mee			800				LKH	80	LKH Main Blk L2 -> SGH, Pt Kim John, OWC, SN Jonathan 62871234
Hai	Amm	Bd	Jm	1015		1210		2W	90	NTUC NH @ Jurong West -> NTFH Tower A73, OWC, 96171234 Brother will bring down Pt from NH
Hai	Amm			900				Dis	50	SGH W57-10-1 -> Pacific NH Seetoh John	Cancelled
BH	VL			1000				DC	60	263 Boon Lay Dr #XX-XXX --> SGH AE Mdm Loh 94228950
				1400				OV	90	450 AMK Ave 10 #XX-XXX -> OV Balestier L5, Pt Tee John, OWC	Cancelled
BH	VL	Huq	Haz	1345		1500		2W	90	St Andrew @ Henderson L4-48 -> NUH Kent Ridge Wing, Pt Lau John, OWC, 97731234 / 96631234
Huq	Haz	Huq	Haz	1415		1800		OV	90	OV Simei L6 -> NUH L3 Main Bld Heart Ctr Pt Suan John, MRSA Pt, Stretcher
Yazid	At	Bh	Vl	1530		1830		Ov	110	Ov Simei L3 -> CGH L2, Pt Tau John, OWC
Sg	Sur	Sg	Sur	1400		1500		OV	90	OV Biggin Hill 52B -> Sata Tampines, Pt Anwar John, Sn Abel, Stretcher, Wait around 20 - 30 mins
Yaz	At	Sg	Sur	1330		1600		OV	90	OV Simei L2 -> CGH B Main Bld L2, Pt Rokiah Jane, Stretcher, 94691234
Por	Red			1500				Dis	50	AMK CH L2 Wd1 West Wing Bed 1315 -> 269A Yishun St 22 #XX-XXX, Pt Lee John, Motorized WC, Need Lifter, SN Robbie 64501234, Collect cash from Wd
St	Sh			250				SGH	74.9	SGH Fever Ctr -> KKH A/E
St	Sh			640				DC	150	718 Jurong West St 71 #XX-XXX -> NUH A/E, 97941234
Ir	Yati			920				DC	100	113 AMK Ave 4 #XX-XXX -> TTSH A/E 92751234
Sg	Sur			946				1777	150	304 Hougang Ave 5 #XX-XXX -> TTSH A/E 98461234
Sg 	Sur			1300				OV	45	Raffles Hosp L9 B966 -> OV Sims L3 R2 B12, Pt Pua John SXX247E, MRSA
Huq	Has			1300				OV	60	OV Simei L6 -> SGH A/E Pt Tang Jane
Hai	Amm			1300				SGH	48.15	SGH Obs r 10-5 -> AH-10-4-12 Pt Pok John
Hai	Amm			1500				Dis	50	CGH Wd45-84 -> 165 Tampines St 12 #09-305, Pt Lim Jane 96651234
Bd	Jm			1430				OV	60	OV Sims L3 -> TTSH A/E Pt Lim John
BH	Vl			1430				DC	100	63 Circuit Road #10-281 -> SGH A/E 98621234
Gv	Ct			1525				1777	170	642A Punggol Drive #XX-XXX -> TTSH A/E 98271234
St	Sh			2200				DC	150	121 BB West Ave #XX-XXX -> NTFH A/E 96261234
St	Sh			2310				Ov	100	OV Marsiling L3 -> KTPH A/E
St	Sh			20				SKH	160	SKH A/E -> SGH Wd 44
St	Sh			640				SGH	150	718 Jurong West St 71 -> NUH A/E
St	Sh			250				SGH	74.9	SGH -> KKH Pt Jan John
Zid	Mu			2100				St Luke	90	St Luke -> NUH A/E
Mid	Zim			2000				KTPH	85.6	KTPH A/E -> SGH A/E IPT ID 21000
`

function toTime(s: string) {
  if (s === '') {
    return null
  }

  const padded = s.padStart(4, '0')
  const hour = parseInt(padded.substring(0, 2))
  const minute = parseInt(padded.substring(2, 4))

  return hour * 3600e3 + minute * 60e3
}

export default function (): Job[] {
  const now = new Date
  const r = JOBS
    .split('\n')
    .filter(Boolean)
    .map(s => s.split('\t'))
    .map(s => ({
      trip: {
        id: uniqueId(),
        driver: s[0] || null,
        medic: s[1] || null,
        startTime: toTime(s[4]) as number,
        endTime: toTime(s[5]),
        created: Date.now(),
        updated: Date.now(),
        startPostcode: null,
        endPostcode: null,
        startAddress: null,
        endAddress: null,
        startLocation: null,
        endLocation: null,
        startLatLng: null,
        endLatLng: null,
        description: 'test trip',
        cancelled: false,
        isTentative: false,
        relatedTrip: null,
        isReturnTrip: false,
        templateTrip: null,
        hideFromManifest: false,
        lastSMSTimestamp: null,
      },
      secondTrip: (s[2] || s[3] || s[6]) ? {
        id: uniqueId(),
        driver: s[2] || null,
        medic: s[3] || null,
        startTime: toTime(s[6]) as number,
        endTime: toTime(s[7]),
        created: Date.now(),
        updated: Date.now(),
        startPostcode: null,
        endPostcode: null,
        startAddress: null,
        endAddress: null,
        startLocation: null,
        endLocation: null,
        startLatLng: null,
        endLatLng: null,
        description: 'test trip',
        cancelled: false,
        isTentative: false,
        relatedTrip: null,
        isReturnTrip: false,
        templateTrip: null,
        hideFromManifest: false,
        lastSMSTimestamp: null,
      } : null,
      date: Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
      type: s[8],
      price: s[9] ? parseFloat(s[9]) : null,
      description: s[10],
      cancelled: s[11] === 'Cancelled',
      startPostcode: null,
      endPostcode: null,
      startAddress: null,
      endAddress: null,
      startLocation: null,
      endLocation: null,
      startLatLng: null,
      endLatLng: null,
      templateTrip: null,
    }))
  return r
}
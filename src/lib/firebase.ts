import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

const config = {
  apiKey: "AIzaSyD13f_m0clyvTunsWRoyvhmBF1r5Lrqt4w",
  authDomain: "ams-bookings-planner.firebaseapp.com",
  databaseURL: "https://ams-bookings-planner.firebaseio.com",
  projectId: "ams-bookings-planner",
  storageBucket: "ams-bookings-planner.appspot.com",
  messagingSenderId: "553699052004"
}
firebase.initializeApp(config)

export const db = firebase.database()
export const auth = firebase.auth()

import {formatDate, AppMode} from './trips'
import querystring from 'querystring'
import * as Vuex from 'vuex'

export function pushModeToHistory(mode: AppMode) {
  if (mode.type === 'date') {
    const dateString = formatDate(new Date(mode.timestamp))
    window.history.pushState(null, dateString, '#' + querystring.stringify({date: dateString}))
  } else if (mode.type === 'template') {
    const dateString = formatDate(new Date(mode.lastTimestamp))
    window.history.pushState(
      null,
      mode.template,
      '#' + querystring.stringify({template: mode.template, lastTimestamp: dateString}))
  }
}

export function initializeHashWatch(store: Vuex.Store<any>) {
  const dateHash = (): AppMode | null => {
    const hash = querystring.parse(window.location.hash.substring(1))
    if (hash.date) {
      const date = new Date(hash.date)
      return isFinite(date.getTime())
        ? {type: 'date', timestamp: date.getTime()}
        : null
    } else if (hash.template) {
      const template = hash.template
      const date = new Date(hash.lastTimestamp)

      return {
        type: 'template',
        template,
        lastTimestamp: isFinite(date.getTime())
          ? date.getTime()
          : Date.now()
      }
    }
    return null
  }

  const handleNewDateHash = () => {
    const d = dateHash()

    if (d) {
      store.dispatch('trips/setMode', d)
      return true
    }
    return false
  }

  window.addEventListener('popstate', handleNewDateHash)

  if (handleNewDateHash()) {
    return
  }
}
import uniqueId from './uniqueId'
import _ from 'lodash'

export interface Message {
  id: string,
  recipients: string[],
  message: string,
  trip: string | null,
  created?: number,
  status?: 'sent' | 'errored' | 'unsent',
  sentTime?: number,
  errorTime?: number,
  lastError?: string,
}

export function parseMessages(d: firebase.database.DataSnapshot): Message[] {
  const messagesRaw = d.val()
  return _.orderBy(Object.entries(messagesRaw), (f: any) => f[1].created, 'desc')
    .map(([key, value]) => {
      const av = value as any

      return {
        id: av.id || key,
        recipients: (av.recipients || '').split(/,/g).filter(Boolean),
        message: av.message || '',
        status: av.status || '',
        trip: av.trip || null,
        created: av.created || null,
      }
    })
}

export class MessageClient {
  db: firebase.database.Database

  constructor(db: firebase.database.Database) {
    this.db = db
  }

  createMessage(message: {recipients: string[], message: string, trip: string | null}) {
    const id = uniqueId()
    this.db.ref(`/sms/${id}`)
    .update({
      id: id,
      recipients: message.recipients.join(','),
      message: message.message,
      trip: message.trip,
      created: Date.now(),
      status: 'unsent',
    })
  }
}
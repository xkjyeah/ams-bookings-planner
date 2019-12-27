import uniqueId from './uniqueId'

export interface Message {
  id: string,
  recipients: string[],
  message: string,
  created?: number,
  status?: 'sent' | 'errored' | 'unsent',
  sentTime?: number,
  errorTime?: number,
  lastError?: string,
}

export class MessageClient {
  db: firebase.database.Database

  constructor(db: firebase.database.Database) {
    this.db = db
  }

  createMessage(message: {recipients: string[], message: string}) {
    const id = uniqueId()
    this.db.ref(`/sms/${id}`)
    .update({
      id: id,
      recipients: message.recipients.join(','),
      message: message.message,
      created: Date.now(),
      status: 'unsent',
    })
  }
}
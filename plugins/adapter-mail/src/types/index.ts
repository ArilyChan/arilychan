import type { ParsedMail } from 'mailparser'
export interface MailContactInterface {
  local?: boolean
  name?: string
  address: string
}

export interface LocalMailContactInterface extends MailContactInterface {
  local: true
  folders?: string[]
}

export interface Mail<T extends MailContactInterface = any> extends Omit<ParsedMail, 'from' | 'to'>{
  from: T
  to: T | T[]
}

export interface OutgoingMail<T extends LocalMailContactInterface = any> extends Mail<T> {
  from: T
}

export interface IncomingMail<T extends LocalMailContactInterface = any> extends Mail<T> {
  to: T | T[]
}

export interface IncomingMessage {
  from: {
    name: string
    id: string
  }
  content: string
  id?: any
}

export type MailSubscriber = (mail: IncomingMail) => void

export type MessageSubscriber = (message: IncomingMessage) => void

import type { ParsedMail } from 'mailparser'
export interface MailAddressInterface {
  local?: boolean
  name?: string
  address: string
}

export interface LocalMailAddressInterface extends MailAddressInterface {
  local: true
  folders?: string[]
}

export interface Mail<T extends MailAddressInterface = MailAddressInterface> extends Omit<ParsedMail, 'from' | 'to'>{
  from: T
  to: T | T[]
}

export interface OutgoingMail<T extends LocalMailAddressInterface = LocalMailAddressInterface> extends Mail<T> {
  from: T
}

export interface IncomingMail<T extends LocalMailAddressInterface = LocalMailAddressInterface> extends Mail<T> {
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

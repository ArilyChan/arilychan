import type { ParsedMail } from 'mailparser'
export interface MailAddressInterface<Local extends boolean = boolean> {
  local?: Local
  name?: string
  address: string
}

export interface LocalMailAddressInterface extends MailAddressInterface<true> {
  local: true
  folders?: string[]
}

export interface Mail extends Omit<ParsedMail, 'from' | 'to' | 'html'>{
  from: MailAddressInterface
  to: MailAddressInterface | MailAddressInterface[],
  html?: string
}

export interface OutgoingMail extends Mail {
  from: LocalMailAddressInterface
}

export interface IncomingMail extends Mail {
  to: LocalMailAddressInterface | LocalMailAddressInterface[]
}

export interface IncomingMessage {
  from: {
    name?: string
    id: string
  }
  content: string
  id?: any
}

export type MailSubscriber = (mail: IncomingMail) => void

export type MessageSubscriber = (message: IncomingMessage) => void

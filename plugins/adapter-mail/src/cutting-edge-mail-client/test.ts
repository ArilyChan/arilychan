import MailClient from './index'

import { TestSender } from './sender/test-sender'
import { TestReceiver } from './receiver/test-receiver'

const sender = new TestSender()
const receiver = new TestReceiver()

const client = new MailClient({})

void client.useSender(sender)
void client.useReceiver(receiver)

client.subscribe((mail) => {
  console.log('got mail!', mail)
  const to = mail.from
  const from = mail.to
  void sender.send({
    ...mail,
    to,
    from
  })
})

void receiver._fakeMail()

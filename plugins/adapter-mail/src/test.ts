import { MailAddress } from './cutting-edge-mail-client/address'

import * as Senders from './cutting-edge-mail-client/sender'
import * as Receivers from './cutting-edge-mail-client/receiver'
import { Bridge } from './bridge-between-mail-and-message'
import MailClient from './cutting-edge-mail-client'
const test = new Bridge()
const testReceiver = new Receivers.TestReceiver({ name: 'receiver', address: 'receiver@test.js' })
test.useClient(new MailClient())
test.useSender(new Senders.TestSender({ name: 'sender', address: 'sender@test.js' }))
test.useReceiver(testReceiver)

test.bridge()
testReceiver._fakeMail({
  from: new MailAddress({ name: 'sender', address: 'sender@test.js' }),
  html: /* html */`
  <html>
    <head>
      <style>
        p {
          white-space: pre;
        }
      </style>
    </head>
    <body>
      <h1>Test Message</h1>
      <img src="http://example.com/pic1.jpg">
      <span>huh</span>
      <img src="cid:attach1.jpg">
      test2
      <p>% reply before this line %</p>
    </body>
    #k-id=14583#
  </html>
  `,
  attachments: [
    // Binary Buffer attachment
    {
      filename: 'image.png',
      content: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
        '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
        'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
        'base64'
      ),

      cid: 'attach1.jpg', // should be as unique as possible
      related: true,
      type: 'attachment',
      contentType: 'image/png',
      contentDisposition: 'attachment',
      headers: new Map(),
      headerLines: [],
      checksum: '',
      size: 9
    }]
})

test.subscribe((message) => {
  console.log('received message:', message)
  test.sendMessage({ to: { id: message.from.id, name: message.from.name }, from: { id: 'receiver@test.js', name: 'tester' }, content: message.content })
})

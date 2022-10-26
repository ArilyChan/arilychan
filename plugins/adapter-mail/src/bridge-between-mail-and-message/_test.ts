
import * as Senders from '../cutting-edge-mail-client/sender'
import * as Receivers from '../cutting-edge-mail-client/receiver'
import { Bridge } from './'
const test = new Bridge()
const testReceiver = test.createReceiver(Receivers.TestReceiver)
test.useClient(test.createClient({}))
test.useReceiver(testReceiver)
test.useSender(test.createSender(Senders.TestSender))

test.bridge()
testReceiver._fakeMail()
testReceiver._fakeMail({
  text: null,
  html: `
  <html>
    <head>
      <style>
        html {color: white}
      </style>
    </head>
    <body>
    <h1>Test Message</h1>
    <img src="http://example.com/pic1.jpg">
    <span>huh</span>
    <img src="cid:attach1.jpg">
    test2
    </body>
    % reply beyond this line %
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

      cid: 'attach1.jpg' // should be as unique as possible
    }]
})

test.subscribe((message) => {
  console.log(message)
  void test.sendMessage({ id: 'a@ri.mk' }, message.content)
})

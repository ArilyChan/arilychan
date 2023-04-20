"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./cutting-edge-mail-client/address");
const Senders = __importStar(require("./cutting-edge-mail-client/sender"));
const Receivers = __importStar(require("./cutting-edge-mail-client/receiver"));
const bridge_between_mail_and_message_1 = require("./bridge-between-mail-and-message");
const cutting_edge_mail_client_1 = __importDefault(require("./cutting-edge-mail-client"));
const test = new bridge_between_mail_and_message_1.Bridge();
const testReceiver = new Receivers.TestReceiver({ name: 'receiver', address: 'receiver@test.js' });
test.useClient(new cutting_edge_mail_client_1.default());
test.useSender(new Senders.TestSender({ name: 'sender', address: 'sender@test.js' }));
test.useReceiver(testReceiver);
test.bridge();
testReceiver._fakeMail({
    from: new address_1.MailAddress({ name: 'sender', address: 'sender@test.js' }),
    html: /* html */ `
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
  </html>
  `,
    attachments: [
        // Binary Buffer attachment
        {
            filename: 'image.png',
            content: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC', 'base64'),
            cid: 'attach1.jpg',
            contentType: 'image/png',
            contentDisposition: 'attachment'
        }
    ]
});
test.subscribe((message) => {
    console.log('received message:', message);
    test.sendMessage({ to: { id: message.from.id, name: message.from.name }, from: { id: 'receiver@test.js', name: 'tester' }, content: message.elements });
});

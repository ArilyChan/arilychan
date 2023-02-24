/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.1/socket.io.js')

socket = null
listeners = new Map()

function connect (...args) {
  socket = io(...args)
  console.log(socket)
}

function on (eventName) {
  if (listeners.has(eventName)) return
  listeners.set(eventName, (...args) => self.postMessage({
    parentJob: 'emit',
    args: [eventName, ...args]
  }))
  socket.on(eventName, listeners.get(eventName))
}

function off (eventName) {
  if (!listeners.has(eventName)) return
  socket.off(eventName, listeners.get(eventName))
  listeners.delete(eventName)
}
// author:herbert qq:464884492
onmessage = function ({ data }) {
  const action = data.action
  const args = data.args
  this[action](...args)
}

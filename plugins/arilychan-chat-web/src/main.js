// polyfill
import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'

Vue.config.devtools = true

Vue.directive('scroll-bottom', (el, binding, vnode) => {
  vnode.context.$nextTick(() => {
    el.scrollTop = el.scrollHeight - el.clientHeight
  })
})

const options = { } // Options object to pass into SocketIO
const io = SocketIO('http://34.84.137.137:3004/chat', options)

Vue.use(new VueSocketIO({
  debug: true,
  connection: io, // options object is Optional
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
})
)
// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App/>',
  store,
  sockets: {
    connect () {
      if (store.state.networkStatus === 'disconnected') {
        store.dispatch('rejoinRooms')
      }
      store.commit('NETWORKSTATUS_CHANGE', 'connected')
    },
    disconnect () {
      console.log('socket disconnected')
      store.commit('NETWORKSTATUS_CHANGE', 'disconnected')
    }
  }
})

export { io }

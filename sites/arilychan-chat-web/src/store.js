/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */

import Vue from 'vue'
import Vuex from 'vuex'
import { io } from './main'
const zango = require('zangodb')
const db = new zango.Db('chat', { messages: ['room', 'message.user.id', 'message.date', 'message.self'] })
const collection = db.collection('messages')
const lastMessagesFromRoom = async (id, start) => {
  // const now = new Date()
  if (!start) {
    start = new Date()
    start.setDate(start.getDate() - 3)
  }
  return await collection.find({ room: id }).filter({ 'message.date': { $gte: start } }).toArray()
}

Vue.use(Vuex)

// const now = new Date()
const store = new Vuex.Store({
  state: {
    networkStatus: 'unknown',
    // 当前用户
    user: {
      name: 'coffce',
      img: 'images/1.jpg'
    },
    // 会话列表
    sessions: [
      {
        id: '1',
        type: 'group',
        user: {
          name: 'default-chat',
          img: 'images/1.jpg',
          token: ''
        },
        messages: []
      }
      // {
      //   id: 1,
      //   type: 'private',
      //   user: {
      //     name: '示例介绍',
      //     img: 'images/2.png'
      //   },
      //   messages: [
      //     {
      //       content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
      //       date: now
      //     }, {
      //       content: '项目地址: https://github.com/coffcer/vue-chat',
      //       date: now
      //     }
      //   ]
      // },
      // {
      //   id: 2,
      //   type: 'private',
      //   user: {
      //     name: 'webpack',
      //     img: 'images/3.jpg'
      //   },
      //   messages: []
      // }
    ],
    // 当前选中的会话
    currentSessionId: undefined,
    // 过滤出只包含这个key的会话
    filterKey: ''
  },
  getters: {
    session: ({ sessions, currentSessionId }) => sessions.find(session => session.id === currentSessionId),
    user: ({ user }) => user,
    filterKey: ({ filterKey }) => filterKey,
    // 过滤后的会话列表
    sessions: ({ sessions, filterKey }) => {
      const result = sessions.filter(session => session.user.name.includes(filterKey))
      return result
    },
    // 当前会话index
    currentId: ({ currentSessionId }) => currentSessionId
  },
  mutations: {
    INIT_DATA (state) {

    },
    LAST_1000_MESSAGE ({ sessions, currentSessionId }, id) {
      const session = sessions.find(item => id === currentSessionId)
      if (session.messages.length < 1000) return
      session.messages.slice(-1000, session.messages.length)
    },
    // 发送消息
    SEND_MESSAGE ({ sessions, currentSessionId }, content) {
      const session = sessions.find(item => item.id === currentSessionId)
      if (!session) throw new Error('no session')
      const m = {
        content: content,
        date: new Date(),
        self: true
      }
      session.messages.push(m)
      collection.insert({
        room: currentSessionId,
        message: m
      })
    },
    RECV_MESSAGE ({ sessions }, content) {
      const session = sessions.find(item => item.id === content.id)
      if (!session) throw new Error('no session')
      const m = {
        content: content.message,
        date: new Date(),
        user: content.user,
        self: false
      }
      session.messages.push(m)
      collection.insert({
        room: content.id,
        message: m
      })
    },
    // 选择会话
    SELECT_SESSION (state, id) {
      state.currentSessionId = id
    },
    CREATE_SESSION (state, data) {
      if (state.sessions.find(joined => joined.id === data.id)) return
      state.sessions.push({
        id: data.id,
        type: data.type,
        user: {
          id: data.id,
          name: data.name || data.id.toString(),
          img: data.avatar || 'images/1.jpg'
        },
        messages: []
      })
    },
    RESTORE_SESSION (state, data) {
      const duplicated = state.sessions.findIndex(joined => joined.id === data.id)
      if (duplicated === -1) return state.sessions.push(data)
      if (!state.sessions[duplicated].messages) state.sessions[duplicated].messages = []
      state.sessions[duplicated].messages.push(...data.messages)
    },
    // 搜索
    SET_FILTER_KEY (state, value) {
      state.filterKey = value
    },
    CHANGE_USERDATA (state, value) {
      state.user = {
        ...state.user,
        ...value
      }
    },
    NETWORKSTATUS_CHANGE (state, value) {
      state.networkStatus = value
    }
  },
  actions: {
    rejoinRooms: ({ commit, state, dispatch }) => {
      if (state.networkStatus !== 'disconnected') return
      state.sessions.map(joined => {
        return io.emit('join-room', { room: joined.id })
      })
    },
    initData: ({ commit, state, dispatch }) => {
      try {
        const joinedSessions = JSON.parse(localStorage.getItem('vue-chat-session'))
        if (joinedSessions && joinedSessions.length) {
          joinedSessions.forEach(async joined => {
            const messages = await lastMessagesFromRoom(joined.id)
            joined.messages = messages.map(rec => rec.message)
            commit('RESTORE_SESSION', joined)
          })
        }
        state.sessions.map(joined => {
          return io.emit('join-room', { room: joined.id })
        })
      } catch (err) {
      }
      let user = { ...state.user }
      try {
        const localStorageUser = JSON.parse(localStorage.getItem('user'))
        user = { ...user, ...localStorageUser }
        if (!user.id) user.id = Math.floor(Math.random() * 2147483647)
        localStorage.setItem('user', JSON.stringify(user))
        dispatch('changeUserData', user)
      } catch (error) {
      }
    },
    changeUserData: ({ commit, state }, data) => {
      commit('CHANGE_USERDATA', data)
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    sendMessage: ({ commit, state }, content) => {
      const session = state.sessions.find(item => item.id === state.currentSessionId)
      io.emit('client-message', {
        room: session.id,
        message: content,
        user: state.user
      })
      commit('SEND_MESSAGE', content)
      commit('LAST_1000_MESSAGE', session.id)
    },
    selectSession: ({ commit }, id) => commit('SELECT_SESSION', id),
    search: ({ commit }, value) => commit('SET_FILTER_KEY', value),
    reciveMessage: ({ commit }, content) => {
      commit('RECV_MESSAGE', content)
      commit('LAST_1000_MESSAGE', content.id)
    },
    createSession: ({ commit }, data) => commit('CREATE_SESSION', data),
    'SOCKET_joined-room': ({ dispatch, state }, { room, type }) => {
      dispatch('createSession', {
        id: room,
        type: type
      })
      if (!state.currentSessionId) dispatch('selectSession', room)
    },
    'SOCKET_client-message': ({ dispatch }, { room, user = {}, message }) => {
      dispatch('reciveMessage', {
        id: room,
        user,
        message
      })
    }
  }
})

store.watch(
  (state) => state.sessions,
  (val) => {
    localStorage.setItem('vue-chat-session', JSON.stringify(val.map(({ id, type, user }) => ({ id, type, user }))))
  },
  {
    deep: true
  }
)

export default store

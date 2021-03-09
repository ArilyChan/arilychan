<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['user', 'session'])
  },
  filters: {
    // 将日期过滤为 hour:minutes
    time (date) {
      if (typeof date === 'string') {
        date = new Date(date)
      }
      const time = date.getHours() + ':' + date.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
      const now = new Date()
      if (date.toDateString() === now.toDateString()) return time
      else return date.toDateString() + ' ' + time
    }
  },
  methods: {
    CQImageToSrc (line) {
      let src = line.split('file=')[1]
      src = src.split(',')[0]
      src = src.split(']')[0]
      if (!src.startsWith('base64://')) { return src }

      src = src.slice(9)
      // Decode the string
      const decoded = window.atob(src)

      // if the file extension is unknown
      let extension
      // do something like this
      const lowerCase = decoded.toLowerCase()
      if (lowerCase.indexOf('png') !== -1) extension = 'png'
      else if (lowerCase.indexOf('jpg') !== -1 || lowerCase.indexOf('jpeg') !== -1) { extension = 'jpg' } else extension = 'tiff'

      return 'data:image/' + extension + ';base64,' + src
    },
    textCQCode (line) {
      return line.startsWith('[CQ:')
    },
    htmlCQCode (line) {
      return false
    },
    CQCodeToText (line) {
      const type = line.slice(4).split(',')[0]
      switch (type) {
        case 'at':
          return `@${line.split('qq=')[1].split(',')[0].slice(0, -1)}`

        default:
          break
      }
    }
  }
}
</script>

<template>
<div class="message" v-scroll-bottom="session.messages">
    <ul v-if="session">
        <li v-for="(item,index) in session.messages" :key="index">
            <p class="time" v-if="index === 0">
                <span>{{ item.date | time }}</span>
            </p>
            <p class="time" v-else-if="new Date(item.date).getMinutes() > new Date(session.messages[index - 1].date).getMinutes()">
                <span>{{ item.date | time }}</span>
            </p>
            <div class="main" :class="{ self: item.self }">
                <img class="avatar" width="30" height="30" :src="item.self ? user.img : session.user.img" />
                <div style="display: flex; flex-direction: column; flex-grow: 0">
                    <span v-if="!item.self"><small>{{item.user.name || item.user.id }}</small></span>
                    <div class="text" style="width: fit-content">
                        <div v-for="(line,index) of item.content.split('\n')" :key="index">
                            <img v-if="line.startsWith('[CQ:image')" :src="CQImageToSrc(line)" class="chat-image">
                            <p v-else-if="textCQCode(line)">{{CQCodeToText(line)}}</p>
                            <p v-else>{{line}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</div>
</template>

<style lang="less" scoped>
.message {
    padding: 10px 15px;
    overflow-y: scroll;

    li {
        margin-bottom: 15px;
    }
    .time {
        margin: 7px 0;
        text-align: center;

        > span {
            display: inline-block;
            padding: 0 18px;
            font-size: 12px;
            color: #fff;
            border-radius: 2px;
            background-color: #dcdcdc;
        }
    }
    .avatar {
        float: left;
        margin: 20px 1rem 0 0;
        border-radius: 3px;
    }
    .text {
        display: flex;
        flex-direction: column;
        position: relative;
        padding: calc(1rem / 3 * 2);
        max-width: ~'calc(100% - 40px)';
        min-height: 30px;
        line-height: 1;
        font-size: 12px;
        text-align: left;
        word-break: break-all;
        background-color: #fafafa;
        border-radius: 4px;
        max-width: 60%;

        &:before {
            content: " ";
            position: absolute;
            top: 9px;
            right: 100%;
            border: 6px solid transparent;
            border-right-color: #fafafa;
        }
        .chat-image{
            border-radius: 4px;
            width: 100%;
        }
        p {
            margin: 0;
            line-height: 1.5
        }
    }

    .self {
        // text-align: right;

        .avatar {
            float: right;
            margin: 0 0 0 10px;
        }
        .text {
            align-self: flex-end;
            background-color: #b2e281;

            &:before {
                right: inherit;
                left: 100%;
                border-right-color: transparent;
                border-left-color: #b2e281;
            }
        }
    }
}
</style>

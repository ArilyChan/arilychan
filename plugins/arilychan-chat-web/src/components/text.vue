<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      content: ''
    }
  },
  methods: {
    ...mapActions(['sendMessage']),
    onKeyup (e) {
      if (e.ctrlKey && e.keyCode === 13 && this.content.length) {
        this.sendMessage(this.content)
        this.content = ''
      }
    }
  }
}
</script>

<template>
  <div class="text">
    <textarea
      placeholder="按 Ctrl + Enter 发送"
      v-model="content"
      @keyup="onKeyup"
    ></textarea>
    <a @click.stop="() => {
      if (content.length) sendMessage(content)
      content = ''
      }" href="#">Send</a>
  </div>
</template>

<style lang="less" scoped>
.text {
  display: inline-block;
  position: relative;
  height: 160px;
  border-top: solid 1px #ddd;

  textarea {
    display: block;
    padding: 10px;
    height: 100%;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
  }

  a {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1;

    display: inline-block;
    height: 50px;
    line-height: 50px;
    width: 150px;

    text-decoration: none;
    text-align: center;
    font-size: 18px;
    color: white;
    border-radius: 4px;

    transition: background-image 150ms ease;

    &:after,
    &:before {
      content: "";
      position: absolute;
      height: 100%;
      width: 100%;
      background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
      border-radius: 4px;
      left: 0;
      z-index: -1;
      transition: opacity 200ms ease;
    }

    &:before {
      background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
      opacity: 0;
    }

    &:active {
      &:before {
        opacity: 1;
      }
      &:after {
        opacity: 0;
      }
    }
  }
}
</style>

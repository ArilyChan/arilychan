<script>
import { mapActions, mapGetters } from 'vuex'
// import { actions } from '../store';

export default {
  computed: {
    ...mapGetters(['user']),
    name: {
      get () {
        return this.user.name
      },
      set (val) {
        if (val === '') val = null
        this.changeUserData({
          name: val
        })
      }
    },
    token: {
      get () {
        return this.user.token
      },
      set (val) {
        if (val === '') val = null
        this.changeUserData({
          token: val
        })
      }
    }
  },
  methods: {
    ...mapActions(['search', 'changeUserData']),
    onKeyup (e) {
      this.search(e.target.value)
    }
  }
}
</script>

<template>
<div class="card">
    <header style="display: flex; align-items: self-end;">
        <img class="avatar" width="40" height="40" :alt="user.name" :src="user.img">
        <div>
          <input class="search" v-model="name" placeholder="your name" />
        </div>
    </header>
    <footer>
        <p>在下面填你的token</p>
        <input class="search" v-model="token" placeholder="token" />
        <p>发送 !bindqq 可以生成一个</p>
        <p>发送token给小阿日绑定qq</p>
        <p>不需要绑定qq可以不填</p>
        <hr>
        <!--// eslint-disable-next-line vue/valid-v-on -->
        <input class="search" type="text" placeholder="search user..." @keyup="onKeyup">
    </footer>
</div>
</template>

<style scoped lang="less">
.card {
    padding: 12px;
    border-bottom: solid 1px #24272C;

    footer {
        margin-top: 10px;
    }

    .avatar, .name {
        vertical-align: middle;
    }
    .avatar {
        border-radius: 2px;
    }
    .name {
        display: inline-block;
        margin: 0 0 0 15px;
        font-size: 16px;
    }
    .search {
        padding: 0 10px;
        width: 100%;
        font-size: 12px;
        color: #fff;
        height: 30px;
        line-height: 30px;
        border: solid 1px #3a3a3a;
        border-radius: 4px;
        outline: none;
        background-color: #26292E;
    }
}
</style>

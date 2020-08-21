<template>
    <div class="columns is-multiline is-mobile is-vcentered is-centered my-0" style="height: 100%;">
      <div class="column is-12" style="max-width: 640px;">
        <div class="card-content">
          <div class="has-text-centered">
            <img v-if="mode == 0" src="@/assets/images/single.png" alt="top">
            <img v-if="mode == 1" src="@/assets/images/multi.png" alt="top">
          </div>
          <div class="field">
            <label for="" class="label">モード</label>
            <div class="tabs is-toggle is-fullwidth">
              <ul>
                <li :class="{ 'is-active': mode == 0 }" @click="$store.commit('settings/set_mode', 0)">
                  <a>ひとりでブレスト</a>
                </li>
                <li :class="{ 'is-active': mode == 1 }" @click="$store.commit('settings/set_mode', 1)">
                  <a>みんなでブレスト</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="field">
            <label for="theme" class="label">テーマ</label>
            <div class="control">
              <input  type="text"
                      :value="theme"
                      class="input"
                      name="theme"
                      ref="input_theme"
                      autofocus
                      placeholder="ブレストしたいことを入力！"
                      :class="{ 'is-danger': error_theme }">
            </div>
            <p v-if="error_theme" class="has-text-danger">{{ error_theme }}</p>
          </div>
          <div class="field">
            <label for="limit_time" class="label">制限時間（分）</label>
            <div class="control">
              <input  type="number"
                      :value="limit_time"
                      class="input"
                      name="limit_time"
                      ref="input_limit_time"
                      :class="{ 'is-danger': error_limit_time }"
                      placeholder="1~30分で設定できます！">
            </div>
            <p v-if="error_limit_time" class="has-text-danger">{{ error_limit_time }}</p>
          </div>
          <div class="has-text-centered my-5">
            <button class="button is-primary is-rounded is-outlined" @click="start">スタート</button>
            <p class="has-text-grey my-3">ブレスト中にリロードすると<br class="is-hidden-tablet">消えちゃうから注意してね</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import io from 'socket.io-client'

export default {
  data: () => ({
    error_theme: "",
    error_limit_time: "",
    socket: ''
  }),
  mounted() {
    this.$refs.input_theme.focus()
    // ソケット通信を始める
    this.socket = io(`${process.env.base_url}:3001`)
    // craete-roomの結果を受け取る
    this.socket.on('reply-check-room', (res, room_id) => {
      if (res) {
        this.socket.emit('create-room', room_id, this.$refs.input_theme.value.trim(), this.$refs.input_limit_time.value * 60)
        this.$router.push(`bs/${room_id}`)
      } else {
        this.create_room()
      }
    })
    // ウィンドウを閉じたときにルームから立ち去る
    window.onbeforeunload = () => {
      this.socket.close()
    }
  },
  // ページ遷移したときにルームから立ち去る
  beforeRouteLeave(to, from, next) {
    this.socket.close()
    next()
  },
  computed: {
    mode() {
      return this.$store.state.settings.mode
    },
    theme() {
      return this.$store.state.settings.theme
    },
    limit_time() {
      return this.$store.state.settings.limit_time
    }
  },
  methods: {
    start() {
      this.reset_error()
      this.$store.commit('settings/set_theme', this.$refs.input_theme.value.trim())
      this.$store.commit('settings/set_limit_time', this.$refs.input_limit_time.value)
      if (this.limit_time < 1 || this.limit_time > 30) {
        this.error_limit_time = "1〜30で入力して！"
        this.$refs.input_limit_time.focus()
      }
      if (!this.theme) {
        this.error_theme = "入力して！"
        this.$refs.input_theme.focus()
      }
      if (!this.error_theme && !this.error_limit_time) {
        if (this.mode == 0) {
          this.$router.push("/bs")
        } else if (this.mode == 1) {
          this.create_room()
        }
      }
    },
    create_room() {
      const room_id = Math.floor( Math.random() * 100000000 )
      this.socket.emit('check-room', room_id)
      console.log(`create_room ${room_id}`)
    },
    reset_error() {
      this.error_theme = ""
      this.error_limit_time = ""
    }
  }
}
</script>
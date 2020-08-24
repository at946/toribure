<template>
  <div style="height: 100%; display: grid; place-items: center;">
    <div style="max-width: 640px;">
      <div class="has-text-centered">
        <img v-if="mode == 0" src="@/assets/images/single.png" alt="mode image">
        <img v-else src="@/assets/images/multi.png" alt="mode image">
      </div>
      <div class="field">
        <label for="mode" class="label">モード</label>
        <div class="control">
          <label class="radio">
            <input  type="radio"
                    name="foobar"
                    v-model="mode"
                    value=0
            >
            ひとりでブレスト
          </label>
          <label class="radio">
            <input  type="radio"
                    name="foobar"
                    v-model="mode"
                    value=1
            >
            みんなでブレスト
          </label>
        </div>
      </div>
      <div class="field">
        <label for="theme" class="label">テーマ</label>
        <div class="control">
          <input  type="text" 
                  class="input"
                  :class="{ 'is-danger': errors.theme }"
                  ref="theme"
                  v-model.trim="theme"
                  placeholder="ブレストしたいこと"
          >
        <p v-if="errors.theme" class="has-text-danger">{{ errors.theme }}</p>
        </div>
      </div>
      <div class="field">
        <label for="limit_time" class="label">制限時間<small>（分）</small></label>
        <div class="control">
          <input  type="number"
                  class="input"
                  :class="{ 'is-danger': errors.limit_time }"
                  ref='limit_time'
                  v-model.number="limit_time"
                  placehodler="最大30分"
          >
        </div>
        <p v-if="errors.limit_time" class="has-text-danger">{{ errors.limit_time }}</p>
      </div>
      <div class="has-text-centered my-5">
        <p v-if="errors.room" class="has-text-danger has-text-weight-bold">{{ errors.room }}</p>
        <button class="button is-primary is-rounded" @click="start">
          <span v-if="mode == 0">スタート</span>
          <span v-else>部屋を作る</span>
        </button>
        <p class="has-text-grey my-3">ブレスト中にリロードすると<br class="is-hidden-tablet">消えちゃうから注意してね</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import io from 'socket.io-client'

export default {
  data: () => ({
    errors: {/* el: msg */},
  }),

  computed: {
    mode: {
      get()       { return this.$store.state.setting.mode },
      set(value)  { this.$store.commit('setting/set_mode', value) }
    },
    theme: {
      get()       { return this.$store.state.setting.theme },
      set(value)  { this.$store.commit('setting/set_theme', value.trim()) }
    },
    limit_time: {
      get()       { return this.$store.state.setting.limit_time },
      set(value)  { this.$store.commit('setting/set_limit_time', Number(value)) }
    }
  },

  methods: {
    start() {
      this.errors = {}
      // validation begin
      if (this.limit_time > 30 || this.limit_time < 1) {
        this.$set(this.errors, 'limit_time', '1分から30分の間から選んでね！')
        this.$refs.limit_time.focus()
      }

      if (!this.theme) {
        this.$set(this.errors, 'theme', 'テーマを決めてね！')
        this.$refs.theme.focus()
      }

      if (Object.keys(this.errors).length) {
        return
      }
      // validation end

      if (this.mode == 0) {
        // ひとりでブレスト開始
        this.$router.push('/bs')
      } else {
        // みんなでブレスト開始
        const socket = io()
        // create-roomの結果を受け取る
        socket.on('reply-for-create-room', (result, room_id) => {
          if (result) {
            this.$router.push(`/bs/${room_id}`)
          } else {
            this.$set(this.errors, 'room', 'お部屋が混み合ってるみたい。少し時間をおいてみて！')
          }
          socket.close()
        })
        // create-roomを送信する
        socket.emit('create-room', this.theme, this.limit_time)
      }
    }
  }
}
</script>
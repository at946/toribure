<template>
  <div style="display: flex; flex-direction: column; height: 100%;">
    <div class="has-text-centered">
      <div class="card is-shadowless">
        <div class="card-content">
          <p v-if="member_count == 1" class="has-text-centered has-text-danger has-text-weight-bold">一緒にブレストするメンバーにURLをシェアしよう！</p>
          <p class="has-text-right">{{ member_count }} member<span v-if="member_count > 1">s</span></p>
          <p class="has-text-weight-bold">{{ theme }}</p>
          <hr class="my-1">
          <p v-if="limit_time!=0">
            <span class="has-text-weight-bold">{{ String(minute).padStart(2, 0) + " : " + String(second).padStart(2, 0) }}</span>
            <i v-if="!is_started" class="material-icons" style="cursor: pointer;" @click="start_timer()">play_circle_outline</i></p>
        </div>
      </div>
    </div>
    <div style="flex-grow: 1; flex-basis: 0; overflow-y: scroll;" class="mx-5" ref="ideas_field">
      <div class="columns is-multiline is-centered">
        <div class="column is-narrow" v-for="idea in ideas" :key="idea.id">
          <div class="notification is-success is-light">
            <button class="delete" @click="delete_idea(idea.id)"></button>
            {{ idea.content }}
          </div>
        </div>
      </div>
    </div>
    <div class="columns is-centered my-3">
      <div class="column" style="max-width: 640px;">
        <div class="field">
          <div class="control">
            <input  type="text"
                    class="input is-primary has-text-centered"
                    ref="input_item"
                    v-model="idea"
                    autofocus
                    placeholder="どんどんアイデア出してこう！"
                    @keypress.enter.exact="add_idea()">
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
    theme: '',
    limit_time: 0,
    minute: 0,
    second: 0,
    timer: null,
    ideas: [],
    idea: '',
    socket: '',
    member_count: 0,
    is_started: false
  }),
  mounted() {
    this.$refs.input_item.focus()
    if (!this.timer) { this.stop_timer() }
    // ソケット通信を始める
    this.socket = io(`${process.env.base_url}:3001`)
    // ルームに参加する
    this.socket.emit('join-room', this.$route.params.id)
    // ルーム参加時に設定（テーマ、制限時間）を受け取る
    this.socket.on('send-setting', (theme, limit_time) => {
      this.theme = theme
      this.limit_time = limit_time
      this.format_time(this.limit_time)
    })
    // ルームが存在しない場合はトップページにリダイレクトする
    this.socket.on('no-room', () => {
      this.$router.push('/')
    })
    // ルームのカウントダウンをスタートする
    this.socket.on('start-timer', () => {
      if (!this.is_started) {
        this.timer = setInterval(() => { this.countdown() }, 1000)
        this.is_started = true
      }
    })
    // ルームにアイデアが追加されたとき、ローカルにも追加する
    this.socket.on('add-idea', (idea) => {
      this.ideas.push(idea)
    })
    // ルームのアイデアが削除されたとき、ローカルからも削除する
    this.socket.on('delete-idea', (idea_id) => {
      this.ideas.filter((item, index) => {
        if (item.id == idea_id) {
          this.ideas.splice(index, 1)
        }
      })
    })
    this.socket.on('update-member-count', (count) => {
      this.member_count = count
    })
    // ウィンドウを閉じたときにルームから立ち去る
    window.onbeforeunload = () => {
      this.socket.emit('leave-room', this.$route.params.id)
      this.socket.close()
    }
  },
  beforeDestroy() {
    this.stop_timer()
  },
  // ページ遷移したときにルームから立ち去る
  beforeRouteLeave(to, from, next) {
    this.socket.emit('leave-room', this.$route.params.id)
    this.socket.close()
    next()
  },
  methods: {
    countdown() {
      this.limit_time = this.limit_time - 1
      this.format_time(this.limit_time)
      if (this.limit_time <= 0) {
        this.stop_timer()
        alert("Finished!!")
      }
    },
    format_time(sec) {
      this.minute = Math.floor(sec / 60)
      this.second = sec % 60
    },
    start_timer() {
      this.socket.emit('start-timer', this.$route.params.id)
    },
    stop_timer() {
      clearInterval(this.timer)
    },
    add_idea() {
      this.idea = this.idea.trim()
      if (this.idea) {
        const idea = {
          id: `${this.socket.id}-${this.ideas.length}`,
          content: this.idea
        }
        // this.ideas.push(idea)
        this.socket.emit('add-idea', idea, this.$route.params.id)
        this.idea = ""
        this.$nextTick(() => { this.scroll_ideas_bottom() })
      }
    },
    delete_idea(id) {
      this.ideas.filter((item, index) => {
        if (item.id == id) {
          this.ideas.splice(index, 1)
          this.socket.emit('delete-idea', id, this.$route.params.id)
        }
      })
    },
    scroll_ideas_bottom() {
      const target = this.$refs.ideas_field
      target.scrollTop = target.scrollHeight
    }
  }
}
</script>

<style scoped>
.material-icons {
  display: inline-flex!important;
  vertical-align: middle!important;
}
</style>
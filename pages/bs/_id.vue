<template>
  <div class="bs-pancake-parent">

    <section class="section pt-5 pb-1">
      <p v-if="member_count < 2" class="has-text-centered has-text-danger has-text-weight-bold">一緒にブレストするメンバーにURLをシェアしよう！</p>
      <p class="has-text-right">{{ member_count }} member<span v-if="member_count > 1">s</span></p>
    </section>

    <BSHeader :theme="theme"
              :limit_time="limit_time"
              ref="BSHeader"
    />

    <div class="has-text-centered">
      <i v-if="!is_started" class="material-icons has-text-success" style="cursor: pointer;" @click="start()">play_circle_outline</i>
    </div>
    
    <section class="section py-5 bs-pancake-child" ref="ideas_area">
      <div class="columns is-multiline is-centered">
        <div class="column is-narrow" v-for="idea in ideas" :key="idea.id">
          <div class="notification is-success is-light">
            <button class="delete" @click="remove_idea(idea.id)"></button>
            {{ idea.text }}
          </div>
        </div>
      </div>
    </section>

    <InputIdea  @add_idea="add_idea" />


  </div>
</template>

<script>
import io from 'socket.io-client'
import BSHeader from '@/components/BSHeader.vue'
import InputIdea from '@/components/InputIdea.vue'

export default {
  data: () => ({
    theme: '',
    limit_time: 0,
    minute: 0,
    second: 0,
    socket: '',
    member_count: 0,
    idea: '',
    ideas: [],
    is_started: false
  }),

  components: {
    BSHeader,
    InputIdea
  },

  mounted() {
    this.socket = io()
    
    // ルーム参加申請のレスを受け取る
    this.socket.on('reply-for-join-room', (res, theme, limit_time) => {
      if (res) {
        this.theme = theme,
        this.limit_time = limit_time
      } else {
        this.$router.push("/")
      }
    })
    
    // ルームに参加する
    this.socket.emit('join-room', this.$route.params.id)
    
    // メンバー数更新を受け取る
    this.socket.on('update-members', count => {
      this.member_count = count
    })

    // ブレスト開始を受け取る
    this.socket.on('start', () => {
      if (!this.is_started) {
        this.is_started = true
        this.$refs.BSHeader.start_timer()
      }
    })

    // 新しいアイデアを受け取る
    this.socket.on('add-idea', idea => {
      this.ideas.push(idea)
    })
    
    // アイデアを削除する
    this.socket.on('remove-idea', idea_id => {
      this.ideas.filter((idea, index) => {
        if (idea.id == idea_id) {
          this.ideas.splice(index, 1)
        }
      })
    })

    // ウィンドウを閉じたときにルームから立ち去る
    window.onbeforeunload = () => {
      this.socket.emit('leave-room', this.$route.params.id)
      this.socket.close()
    }
  },

  // ページ遷移したときにルームから立ち去る
  beforeRouteLeave(to, from, next) {
    this.socket.emit('leave-room', this.$route.params.id)
    this.socket.close()
    next()
  },

  methods: {
    start() {
      this.socket.emit('start', this.$route.params.id)
    },

    add_idea(idea) {
      this.socket.emit('add-idea', this.$route.params.id, idea)
    },

    remove_idea(idea_id) {
      this.socket.emit('remove-idea', this.$route.params.id, idea_id)
    }
  }
}
</script>
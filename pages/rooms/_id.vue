<template>
  <div>
    <div class="mt-5 mb-2">
      <p v-if="member_count < 2">
        <span  class="text-red">一緒にブレストするメンバーにURLをシェアしよう！</span>
        <button @click="copyUrl"><fa :icon="faShare" /></button>
      </p>
      <p class="text-right">{{ member_count }} member<span v-if="member_count > 1">s</span></p>
    </div>

    <div class="mb-5">
      <input
        type="text"
        v-model="theme"
        @blur="setTheme"
        @keypress.enter.exact="$refs.inputIdea.focus();"
        class="mb-1"
        placeholder="ブレストテーマ"
        autofocus
        ref="inputTheme"
      />
    </div>

    <div class="mb-5">
      <input
        type="text"
        v-model="idea"
        placeholder="アイデアを出しまくろう！"
        @keypress.enter.exact="add_idea"
        ref="inputIdea"
      />
    </div>

    <div class="mb-4" ref="ideas_area">
      <draggable element="div" class="ideas" v-model="ideas" animation=200 delay=50 @end="sort_idea">
        <div v-for="idea in ideas.slice().reverse()" :key="idea.id">
          <div class="m-1 py-1 px-2 idea pointer" :class="idea.id.indexOf(socket.id) === 0 ? 'my-idea' : 'others-idea'">
            <span class="mr-1">{{ idea.text }}</span>
            <button @click="remove_idea(idea.id)"><fa :icon="faTimes" /></button>
          </div>
        </div>
      </draggable>
    </div>

    <div v-if="ideas.length">
      <button class="button is-text" @click="copyIdeas">結果をコピー</button>
    </div>

  </div>
</template>

<script>
import io from 'socket.io-client'
import draggable from 'vuedraggable'
import { faShare, faTimes } from '@fortawesome/free-solid-svg-icons'

export default {
  data () {
    return {
      theme: '',
      socket: '',
      member_count: 0,
      idea: '',
      ideas: [],
      is_started: false
    }
  },

  computed: {
    faShare() { return faShare },
    faTimes() { return faTimes }
  },

  components: {
    draggable
  },

  mounted() {
    this.$refs.inputTheme.focus()
    
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

    // メンバー数更新を受け取る
    this.socket.on('update-members', count => {
      this.member_count = count
    })

    // テーマの更新を受け取る
    this.socket.on('update-theme', req => {
      this.theme = req.theme
    })

    // ideasの更新を受け取る
    this.socket.on('update-ideas', ideas => {
      this.ideas = ideas
    })
    
    // ルームに参加する
    this.socket.emit('join-room', this.$route.params.id)
    

    // ブレスト開始を受け取る
    this.socket.on('start', () => {
      if (!this.is_started) {
        this.is_started = true
        this.$refs.BSHeader.start_timer()
      }
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
    copyUrl() {
      this.$copyText(window.location.origin + this.$route.fullPath)
      alert("URLをクリップボードにコピーしたよ。\nチームメンバーに共有して、この部屋に招待しましょう！")
    },

    setTheme() {
      if (!this.theme) { return }
      this.theme = this.theme.trim()
      if (this.theme) {
        this.socket.emit('set-theme', { room_id: this.$route.params.id, theme: this.theme })
      }
    },

    start() {
      this.socket.emit('start', this.$route.params.id)
    },

    add_idea() {
      if (!this.idea) { return }
      this.idea = this.idea.trim()
      this.socket.emit('add-idea', { room_id: this.$route.params.id, idea: this.idea })
      this.idea = ''
    },

    remove_idea(idea_id) {
      this.socket.emit('remove-idea', this.$route.params.id, idea_id)
    },

    sort_idea(event) {
      this.socket.emit('sort-idea', this.$route.params.id, this.ideas[event.newIndex].id, event.newIndex)
    },

    copyIdeas() {
      var text = `# ${this.theme}\n\n`
      this.ideas.forEach((idea) => {
        text += `- ${idea.text}\n`
      })
      this.$copyText(text)
      alert("ブレストの結果をクリップボードにコピーしたよ！")
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/_color.scss';

  .text-right { text-align: right; }
  .pointer { cursor: pointer; }

  input {
    width: 100%;
    border-bottom: 2px solid lightgrey;
    padding-bottom: .5rem;

    &:focus {
      border-color: $primary;
    }
  }

  .ideas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .idea {
    display: inline-flex;
    align-items: center;
    border-radius: 1rem;
  }

  .my-idea {
    background: lighten($primary, 30%);
  }

  .others-idea {
    background: lighten($blue, 30%);
  }
</style>
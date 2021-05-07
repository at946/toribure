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
      {{ /* ブレストテーマのテキストフィールド */ }}
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

    <div class="mb-3">
      {{ /* アイデアのテキストフィールド */ }}
      <input
        type="text"
        v-model="idea"
        placeholder="アイデアを出しまくろう！"
        @keypress.enter.exact="add_idea"
        ref="inputIdea"
      />
    </div>

    <div class="select-mode mb-2">
      {{ /* 「個人ワークモード」「グループワークモード」選択ボックス */ }}
      <select v-model="mode" @change="updateMode">
        <option value="0">個人ワークモード</option>
        <option value="1">グループワークモード</option>
      </select>
    </div>

    <div class="mb-4" ref="ideas_area">
      <draggable element="div" class="ideas" v-model="ideas" animation=200 delay=50 @end="sort_idea">
        <div v-for="idea in ideas" :key="idea.id">
          <div v-if="mode != 0 || idea.id.indexOf(socket.id) === 0" class="m-1 py-1 px-2 idea pointer" :class="idea.id.indexOf(socket.id) === 0 ? 'my-idea' : 'others-idea'">
            <span class="mr-1">{{ idea.text }}</span>
            <button @click="remove_idea(idea.id)"><fa :icon="faTimes" /></button>
          </div>
        </div>
      </draggable>
    </div>

    <div v-if="(mode == 0 && myIdeas.length > 0) || (mode == 1 && ideas.length > 0)">
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
      is_started: false,
      mode: 0 // 0: individual work, 1: group work
    }
  },

  computed: {
    myIdeas() {
      return this.ideas.filter(el => {
        return ( el.id.indexOf(this.socket.id) === 0)
    })},
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
    this.socket.on('reply-for-join-room', res => {
      if (res.entered) {
        this.theme = res.theme
        this.mode = res.mode
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
      this.ideas = ideas.slice().reverse()
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

    // モードの更新を受け取る
    this.socket.on('update-mode', req => {
      this.mode = req.mode
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
      var text = ''
      // テーマが設定されているときは、テーマもコピーする
      if (!!this.theme) { text += `# ${this.theme}\n\n` }
      // 個人ワークモードの場合、自分のアイデアだけをコピーする
      if (this.mode == 0) {
        this.myIdeas.forEach((idea) => {
          text += `- ${idea.text}\n`
        })
      } else {
        this.ideas.forEach((idea) => {
          text += `- ${idea.text}\n`
        })        
      }
      this.$copyText(text)
      alert("ブレストの結果をクリップボードにコピーしたよ！")
    },

    updateMode() {
      this.socket.emit('update-mode', { room_id: this.$route.params.id, mode: this.mode })
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

  .select-mode {
    text-align: right;

    select {
      border-bottom: 2px solid lightgrey;
      padding: 0 .5rem .5rem .5rem;
      text-align: center;
      cursor: pointer;

      &:focus {
        border-color: $primary;
      }
    }

  }
</style>
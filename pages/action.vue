<template>
  <div style="display: flex; flex-direction: column; height: 100%;">
    <div class="has-text-centered">
      <div class="card is-shadowless">
        <div class="card-content">
          <p class="has-text-weight-bold">{{ theme }}</p>
          <hr class="my-1">
          <p v-if="rest_sec!=0" class="has-text-weight-bold">{{ String(minute).padStart(2, 0) + " : " + String(second).padStart(2, 0) }}</p>
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
import { mapMutations } from 'vuex';

export default {
  data: () => ({
    minute: 0,
    second: 0,
    rest_sec: 1,
    timer: null,
    ideas: [],
    idea: "",
    idea_id: 0,
  }),
  mounted() {
    if (!this.theme) { this.$router.push("/") }
    this.$refs.input_item.focus()
    this.minute = this.limit_time
    this.rest_sec = this.limit_time * 60
    if (!this.timer) { this.stop_timer() }
    this.$nextTick(() => { this.start_timer() })
  },
  computed: {
    theme() {
      return this.$store.state.settings.theme
    },
    limit_time() {
      return this.$store.state.settings.limit_time
    },
  },
  beforeDestroy() {
    this.stop_timer()
  },
  methods: {
    calc_time() {
      this.rest_sec = this.rest_sec - 1
      this.minute = Math.floor(this.rest_sec / 60)
      this.second = this.rest_sec % 60
      if (this.rest_sec <= 0) {
        this.stop_timer()
        alert("Finished!!")
      }
    },
    start_timer() {
      this.timer = setInterval(() => { this.calc_time() }, 1000)
    },
    stop_timer() {
      clearInterval(this.timer)
    },
    add_idea() {
      this.idea = this.idea.trim()
      if (this.idea) {
        this.ideas.push({ id: this.idea_id, content: this.idea })
        this.idea_id = this.idea_id + 1
        this.idea = ""
        this.$nextTick(() => { this.scroll_ideas_bottom() })
      }
    },
    delete_idea(id) {
      this.ideas.filter((item, index) => {
        if (item.id == id) {
          this.ideas.splice(index, 1)
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

<style>
</style>

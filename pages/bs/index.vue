<template>
  <div class="bs-pancake-parent">

    <BSHeader :theme="theme"
              :limit_time="limit_time"
              ref="BSHeader"
    />

    <section class="section py-5 bs-pancake-child" ref="ideas_area">
      <div class="columns is-multiline is-centered">
        <div class="column is-narrow" v-for="(idea, index) in ideas" :key="index">
          <div class="notification is-success is-light">
            <button class="delete" @click="remove_idea(index)"></button>
            {{ idea.text }}
          </div>
        </div>
      </div>
    </section>

    <InputIdea  @add_idea="add_idea" />

  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import BSHeader from '@/components/BSHeader.vue'
import InputIdea from '@/components/InputIdea.vue'

export default {
  data: () => ({
    rest_time: 0,
    minute: 0,
    second: 0,
    ideas: [],
    idea: ''
  }),

  computed: {
    theme()       { return this.$store.state.setting.theme },
    limit_time()  { return this.$store.state.setting.limit_time }
  },

  components: {
    BSHeader,
    InputIdea
  },

  mounted() {
    if (this.timer) { this.stop_timer() }
    this.rest_time = this.limit_time * 60
    this.$refs.BSHeader.start_timer()
  },

  methods: {
    add_idea(idea) {
      this.ideas.push({text: idea})
      this.$nextTick(() => { this.scroll_to_last_idea() })
    },

    remove_idea(index) {
      this.ideas.splice(index, 1)
    },

    scroll_to_last_idea() {
      const target = this.$refs.ideas_area
      target.scrollTop = target.scrollHeight
    },
  }
}
</script>
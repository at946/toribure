<template>
  <div class="bs-pancake-parent">

    <BSHeader :theme="theme"
              :limit_time="limit_time"
              ref="BSHeader"
    />

    <CopyResultButton :ideas="ideas" :theme="theme" />

    <section class="section py-5 bs-pancake-child" ref="ideas_area">
      <draggable element="div" class="columns is-multiline is-centered" v-model="ideas" animation=200 delay=50>
        <div class="column is-narrow" style="cursor: pointer;" v-for="(idea) in ideas" :key="idea.id">
          <div class="notification is-success is-light">
            <button class="delete" @click="remove_idea(idea.id)"></button>
            {{ idea.text }}
          </div>
        </div>
      </draggable>
    </section>

    <InputIdea  @add_idea="add_idea" />

  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import BSHeader from '@/components/BSHeader.vue'
import CopyResultButton from '@/components/CopyResultButton.vue'
import InputIdea from '@/components/InputIdea.vue'
import draggable from 'vuedraggable'

export default {
  data: () => ({
    rest_time: 0,
    minute: 0,
    second: 0,
    ideas: [],
    idea: '',
    counter: 0,
  }),

  computed: {
    theme()       { return this.$store.state.setting.theme },
    limit_time()  { return this.$store.state.setting.limit_time }
  },

  components: {
    BSHeader,
    CopyResultButton,
    InputIdea,
    draggable
  },

  mounted() {
    if (this.timer) { this.stop_timer() }
    this.rest_time = this.limit_time * 60
    this.$refs.BSHeader.start_timer()
  },

  methods: {
    add_idea(idea) {
      this.ideas.push({id: this.counter, text: idea})
      this.counter++
      this.$nextTick(() => { this.scroll_to_last_idea() })
    },

    remove_idea(idea_id) {
      this.ideas.filter((idea, index) => {
        if (idea.id == idea_id) {
          this.ideas.splice(index, 1)
        }
      })
    },

    scroll_to_last_idea() {
      const target = this.$refs.ideas_area
      target.scrollTop = target.scrollHeight
    },
  }
}
</script>
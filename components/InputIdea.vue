<template>
  <section class="section py-5">
    <div class="field" style="max-width: 640px; margin-right: auto; margin-left: auto;">
      <div class="control">
        <input  type="text"
                class="input is-primary has-text-centered"
                ref="idea"
                v-model="idea"
                placeholder="アイデアを出しまくろう！"
                @keypress.enter.exact="add_idea"
        >
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data: () => ({
    idea: ''
  }),

  mounted() {
    this.$refs.idea.focus()
  },

  methods: {
    add_idea() {
      this.idea = this.idea.trim()
      if (this.idea) {
        this.$emit('add_idea', this.idea)
        this.idea = ''
      }
    }
  }
}
</script>
<template>
    <div class="columns is-multiline is-mobile is-vcentered is-centered my-0" style="height: 100%;">
      <div class="column is-12" style="max-width: 640px;">
        <div class="card-content">
          <div class="has-text-centered">
            <img src="@/assets/images/top.png" alt="top">
          </div>
          <div class="field">
            <label for="theme" class="label">ブレストすること</label>
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
            <label for="limit_time" class="label">ブレスト時間（分）</label>
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
import { mapMutations } from 'vuex';

export default {
  data: () => ({
    error_theme: "",
    error_limit_time: ""
  }),
  mounted() {
    this.$refs.input_theme.focus()
  },
  computed: {
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
      this.$store.commit('settings/set_theme', this.$refs.input_theme.value)
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
        this.$router.push("/action")
      }
    },
    reset_error() {
      this.error_theme = ""
      this.error_limit_time = ""
    }
  }
}
</script>

<style>
</style>

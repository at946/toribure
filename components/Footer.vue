<template>
  <footer class="my-0 py-2">
    <div class="mb-2">
      <button class="wrapper-icons p-1" @click="shareToTwitter">
        <fa :icon="faTwitter" class="text-twitter" />
      </button>
    </div>
    <div class="mb-1">
      <nuxt-link to="/terms_of_service" class="mx-1">利用規約</nuxt-link>
      <nuxt-link to="/privacy_policy" class="mx-1">プライバシーポリシー</nuxt-link>
    </div>
    <div>
      created by <a href="https://twitter.com/at_946" target="_blank" class="text-twitter">at946</a>
    </div>
  </footer>
</template>

<script>
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

export default {
  computed: {
    faTwitter() { return faTwitter }
  },

  methods: {
    shareToTwitter() {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent('toribure #toribure\n')}&url=${encodeURIComponent(window.location.origin)}`,
        "_blank"
      )
    }
  }
}
</script>

<style lang="scss" scoped>
footer {
  margin: 1rem 0;
  background: whitesmoke;
  text-align: center;
}
</style>
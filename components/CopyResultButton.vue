<template>
  <div class="has-text-right">
    <button class="button is-text" @click="copy">結果をコピー</button>
  </div>
</template>

<script>
export default {
  props: {
    theme: String,
    ideas: Array, // [{id, text}]
  },

  methods: {
    copy() {
      var text = `${this.theme}\n\n`
      this.ideas.forEach((idea) => {
        text += `・${idea.text}\n`
      })
      this.$copyText(text)
      alert("ブレストの結果をクリップボードにコピーしたよ！")
    }
  }
}
</script>
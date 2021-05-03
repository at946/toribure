<template>
  <div class="hero">
    <div>
      <h1 class="title mb-2">toribure</h1>
      <p>みんなで一緒にブレストしよう！</p>
      <img src="@/assets/images/multi.png" alt="top image">
      <br>
      <button 
        id="btn_create_a_room"
        class="button"
        @click="start"
      >
        <span>部屋を作る</span>
      </button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  methods: {
    start() {
      // ブレスト開始
      const socket = io()
      // create-roomの結果を受け取る
      socket.on('reply-for-create-room', req => {
        // req = { isCreated, room_id }
        if (req.isCreated) {
          this.$router.push(`/rooms/${req.room_id}`)
        } else {
          alert('お部屋が混み合ってるみたい。少し時間をおいてみて！')
        }
        socket.close()
      })
      // create-roomを送信する
      socket.emit('create-room')
    }
  }
}
</script>

<style lang="scss" scoped>
.hero {
  height: 100%;
  display: grid;
  place-items: center;
}

.title {
  font-size: 2rem;
  font-weight: bold;
}

img {
  width: 100%;
  max-width: 400px;
}
</style>
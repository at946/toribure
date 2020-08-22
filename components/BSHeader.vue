<template>
  <section class="has-text-centered section py-5">
    <p class="has-text-weight-bold">{{ theme }}</p>
    <hr class="my-1">
    <p v-if="rest_time > 0" class="has-text-weight-bold">
      {{ `${String(minute).padStart(2, 0)} : ${String(second).padStart(2, 0)}` }}
    </p>
  </section>
</template>

<script>
export default {
  props: {
    theme: String,
    limit_time: Number,
  },

  data: () => ({
    past_time: 0,
    timer: '',
  }),

  beforeDestroy() {
    this.stop_timer()
  },

  computed: {
    rest_time() { return this.limit_time * 60 - this.past_time },
    minute()    { return Math.floor( this.rest_time / 60) },
    second()    { return this.rest_time % 60 }
  },

  methods: {
    start_timer() {
      this.timer = setInterval(() => {
        this.past_time = this.past_time + 1
        if (this.rest_time == 0) {
          this.stop_timer()
          alert("Good job!!")
        }
      }, 1000)
    },

    stop_timer() {
      clearInterval(this.timer)
    },

  }
}
</script>
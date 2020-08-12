export const state = () => ({
  theme: '',
  limit_time: 3
})

export const mutations = {
  set_theme(state, theme) {
    state.theme = theme
  },
  set_limit_time(state, limit_time) {
    state.limit_time = limit_time
  }
}
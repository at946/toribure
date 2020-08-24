export const state = () => ({
  mode: 0,
  theme: '',
  limit_time: 3
})

export const mutations = {

  set_mode(state, mode) {
    state.mode = mode
  },

  set_theme(state, theme) {
    state.theme = theme
  },

  set_limit_time(state, limit_time) {
    state.limit_time = limit_time
  }
}
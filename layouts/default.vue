<template>
  <div style="display: flex; flex-direction: column; height: 100vh;">
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item has-text-weight-bold">
          <img src="@/assets/images/title.png" alt="title">
        </NuxtLink>
      </div>
    </nav>
    <div style="flex: 1;">
      <Nuxt />
    </div>
    <div class="has-background-light" style="margin-top: auto;">
      <p class="py-3 has-text-centered">created by <a href="https://twitter.com/at_946" target="_blank">at</a>.</p>
    </div>
  </div>
</template>

<style>
</style>

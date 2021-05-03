<template>
  <nav class="header bg-primary" role="navigation" aria-label="main navigation">
    <div>
      <NuxtLink to="/" class="ml-2">
        <img src="@/assets/images/logo_header.png" alt="header logo" class="header-logo my-1">
      </NuxtLink>
    </div>
  </nav>
</template>

<style lang="scss" scoped>

.header {
  height: 56px;
  display: inline-flex;
  align-items: center;
}

.header-logo {
  height: 40px;
  display: inline-block;
}
</style>
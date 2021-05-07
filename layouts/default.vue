<template>
  <div class="body">
    <Header />
    <main class="main px-4"><Nuxt /></main>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

export default { 
  components: {
    Header,
    Footer
  } 
}
</script>

<style lang="scss">
@import '@/assets/css/destyle.css';
@import '@/assets/css/_color.scss';
@import '@/assets/css/_spacing.scss';

@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap');

body {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  text-align: center;
  color: $black;
}

.body {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 1080px;
  margin-right: auto;
  margin-left: auto;
}

button {
  &:focus {
    outline: solid 2px $blue;
  }
}

.button {
  @extend .bg-primary;
  color: white;
  @extend .py-2;
  @extend .px-4;
  border-radius: 2rem;

  &:hover, &:focus {
    background: darken($primary, 10%);
  }
}

a {
  display: inline-block;

  &:focus {
    outline: solid 2px $blue;
  }
}
</style>
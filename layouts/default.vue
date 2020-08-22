<template>
  <div style="display: flex; flex-direction: column; height: 100vh;">
    <Header />
    <main style="flex: 1;"><Nuxt /></main>
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
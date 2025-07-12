<template>
  <Header />
  <router-view />
  <Footer />
</template>
<!-- <div>
    <h1>Tours</h1>
    <ul>
      <li v-for="tour in tours" :key="tour.id">{{ tour.name }}</li>
    </ul>
  </div>
</template> -->

<script setup>
import Header from './components/TheHeader.vue';
import Footer from './components/TheFooter.vue';
</script>
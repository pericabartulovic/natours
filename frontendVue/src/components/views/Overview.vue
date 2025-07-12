<template>
  <main class="main">
    <div class="card-container">
      <template v-if="tours.length > 0">
        <Card v-for="tour in tours" :key="tour.id" :tour="tour" />
      </template>
      <template v-else>
        <div class="no-tours-message">
          No tours found.
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';
import Card from '../Card.vue';

const tours = ref([]);

onMounted(async () => {
  const res = await api.get('/tours');
  tours.value = res.data.tours;
});
</script>

<style lang='scss' scoped>
@use "@/assets/styles/variables" as *;

.card-container {
  max-width: 120rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 4rem;
  
  @include respond(md) {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 5rem;
  }

  @include respond(lg) {
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 7rem;
  }
}

.no-tours-message {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 1.25rem;
}
</style>

<template>
  <div>
    <h1>Tours</h1>
    <ul>
      <li v-for="tour in tours" :key="tour.id">{{ tour.name }}</li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from './api'

const tours = ref([])

onMounted(async () => {
  const res = await api.get('/tours')
  console.log(res.data)
  tours.value = res.data.tours
})
</script>
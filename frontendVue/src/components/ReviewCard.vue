<template>
  <div class="reviews__card">
    <div class="reviews__avatar">
      <!-- <img class="reviews__avatar-img" :src="`/img/users/${review.user.photo}`" :alt="review.user.name" /> -->
      <img class="reviews__avatar-img" :src="`http://localhost:3000/img/users/${review.user.photo}`" :alt="review.user.name" />
      <h6 class="reviews__user">{{ review.user.name }}</h6>
    </div>
    <p class="reviews__text">{{ review.review }}</p>
    <div class="reviews__rating">
      <svg v-for="star in 5" :key="star" class="reviews__star"
        :class="`reviews__star--${review.rating >= star ? 'active' : 'inactive'}`">
        <use xlink:href="/img/icons.svg#icon-star"></use>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  review: { type: Object, required: true }
})
</script>

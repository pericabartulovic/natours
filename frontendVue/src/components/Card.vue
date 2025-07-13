<template>
  <div class="card">
    <div class="card__header">
      <div class="card__picture">
        <div class="card__picture-overlay">&nbsp;</div>
        <!-- <img class="card__picture-img" :src="`/img/tours/${tour.imageCover}`" :alt="tour.name" /> -->
        <img class="card__picture-img" :src="`http://localhost:3000/img/tours/${tour.imageCover}`" :alt="tour.name" />
      </div>
      <h3 class="heading-tertirary">
        <span>{{ tour.name }}</span>
      </h3>
    </div>

    <div class="card__details">
      <h4 class="card__sub-heading">
        {{ tour.difficulty }} {{ tour.duration }}-day tour
      </h4>
      <p class="card__text">{{ tour.summary }}</p>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="/img/icons.svg#icon-map-pin"></use>
        </svg>
        <span>{{ tour.startLocation.description }}</span>
      </div>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="/img/icons.svg#icon-calendar"></use>
        </svg>
        <span>
          {{ formattedStartDate }}
        </span>
      </div>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="/img/icons.svg#icon-flag"></use>
        </svg>
        <span>{{ tour.locations.length }} stops</span>
      </div>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="/img/icons.svg#icon-user"></use>
        </svg>
        <span>{{ tour.maxGroupSize }} people</span>
      </div>
    </div>

    <div class="card__footer">
      <p>
        <span class="card__footer-value">{{ tour.price }}€&nbsp;</span>
        <span class="card__footer-text">per person</span>
      </p>
      <p class="card__ratings">
        <span class="card__footer-value">{{ tour.ratingsAverage }}</span>
        <span class="card__footer-text">
          rating ({{ tour.ratingsQuantity }})
        </span>
      </p>
      <a class="btn btn--green btn--small" :href="`/tour/${tour.slug}`">
        Details
      </a>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  tour: {
    type: Object,
    required: true
  }
});

const formattedStartDate = computed(() => {
  const date = new Date(props.tour.startDates[0]);
  return date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
});
</script>

<style lang="scss" scoped>
.card {
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: 0.3s all;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;

  // Vendor prefixes
  -webkit-box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.1);
  -webkit-transition: 0.3s all;
  -webkit-backface-visibility: hidden;
  display: -webkit-box;
  display: -ms-flexbox;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;

  &__header {
    position: relative;
  }

  &__picture {
    position: relative;
    height: 22rem;
    clip-path: polygon(0 0, 100% 0%, 100% 83%, 0% 98%);
    -webkit-clip-path: polygon(0 0, 100% 0%, 100% 83%, 0% 98%);
  }

  &__picture-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    background-image: linear-gradient(to right bottom, #7dd56f, #28b487);
    background-image: -webkit-gradient(linear, left top, right bottom, from(#7dd56f), to(#28b487));
  }

  &__picture-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    -o-object-fit: cover;
  }

  &__details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-row-gap: 1.75rem;
    grid-column-gap: 2rem;
    padding: 2.5rem 3rem;
  }

  &__sub-heading {
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 700;
    grid-column: 1 / -1;
  }

  &__text {
    grid-column: 1 / -1;
    font-size: 1.5rem;
    font-style: italic;
    margin-top: -1rem;
    margin-bottom: 0.75rem;
  }

  &__data {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    display: -webkit-box;
    display: -ms-flexbox;
    -webkit-box-align: center;
    -ms-flex-align: center;

    svg {
      margin-right: 0.7rem;
    }
  }

  &__icon {
    height: 2rem;
    width: 2rem;
    fill: #55c57a;
  }

  &__footer {
    background-color: #f7f7f7;
    padding: 2.5rem 3rem;
    border-top: 1px solid #f1f1f1;
    font-size: 1.4rem;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
    margin-top: auto;
  }

  &__footer-value {
    font-weight: 700;
  }

  &__footer-text {
    color: #999;
  }

  &__ratings {
    grid-row: 2 / 3;
  }

  .btn-small,
  .btn {
    grid-row: 1 / 3;
    justify-self: end;
    align-self: center;
    -ms-flex-item-align: center;
  }
}
</style>
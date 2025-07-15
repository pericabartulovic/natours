<template>
  <div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="tour">
      <!-- Section Header -->
      <section class="section-header">
        <div class="header__hero">
          <div class="header__hero-overlay">&nbsp;</div>
          <!-- <img class="header__hero-img" :src="`/img/tours/${tour.imageCover}`" :alt="tour.name" /> -->
          <img class="header__hero-img" :src="`http://localhost:3000/img/tours/${tour.imageCover}`" :alt="tour.name" />
        </div>
        <div class="heading-box">
          <h1 class="heading-primary">
            <span>{{ tour.name }} tour</span>
          </h1>
          <div class="heading-box__group">
            <div class="heading-box__detail">
              <svg class="heading-box__icon">
                <use xlink:href="/img/icons.svg#icon-clock"></use>
              </svg>
              <span class="heading-box__text">{{ tour.duration }} days</span>
            </div>
            <div class="heading-box__detail">
              <svg class="heading-box__icon">
                <use xlink:href="/img/icons.svg#icon-map-pin"></use>
              </svg>
              <span class="heading-box__text">{{ tour.startLocation.description }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Description -->
      <section class="section-description">
        <div class="overview-box">
          <div>
            <div class="overview-box__group">
              <h2 class="heading-secondary ma-bt-lg">Quick facts</h2>
              <OverviewBox label="Next date" :text="nextDate" icon="calendar" />
              <OverviewBox label="Difficulty" :text="tour.difficulty" icon="trending-up" />
              <OverviewBox label="Participants" :text="`${tour.maxGroupSize} people`" icon="user" />
              <OverviewBox label="Rating" :text="`${tour.ratingsAverage} / 5`" icon="star" />
            </div>
            <div class="overview-box__group">
              <h2 class="heading-secondary ma-bt-lg">Your tour guides</h2>
              <div v-for="guide in tour.guides" :key="guide._id" class="overview-box__detail">
                <!-- <img class="overview-box__img" :src="`/img/users/${guide.photo}`" :alt="guide.name" /> -->
                <img class="overview-box__img" :src="`http://localhost:3000/img/users/${guide.photo}`"
                  :alt="guide.name" />
                <span class="overview-box__label" v-if="guide.role === 'lead-guide'">Lead guide</span>
                <span class="overview-box__label" v-else-if="guide.role === 'guide'">Tour guide</span>
                <span class="overview-box__text">{{ guide.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="description-box">
          <h2 class="heading-secondary ma-bt-lg">About {{ tour.name }} tour</h2>
          <p class="description__text" v-for="(p, i) in descriptionParagraphs" :key="i">{{ p }}</p>
        </div>
      </section>

      <!-- Section Pictures -->
      <section class="section-pictures">
        <div class="picture-box" v-for="(img, i) in tour.images" :key="img">
          <!-- <img class="picture-box__img" :src="`/img/tours/${img}`" :alt="`The Park Camper Tour ${i + 1}`" -->
          <img class="picture-box__img" :src="`http://localhost:3000/img/tours/${img}`"
            :alt="`The Park Camper Tour ${i + 1}`" :class="`picture-box__img--${i + 1}`" />
        </div>
      </section>

      <!-- Section Map -->
      <section class="section-map">
        <MapBoxMap v-if="tour && tour.locations" :locations="tour.locations" />
      </section>

      <!-- Section Reviews -->
      <section class="section-reviews">
        <div class="reviews">
          <ReviewCard v-for="review in tour.reviews" :key="review._id" :review="review" />
        </div>
      </section>

      <!-- Section CTA -->
      <section class="section-cta">
        <div class="cta">
          <div class="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="Natours logo" />
          </div>
          <!-- <img class="cta__img cta__img--1" :src="`/img/tours/${tour.images[1]}`" alt="Tour picture" />
          <img class="cta__img cta__img--2" :src="`/img/tours/${tour.images[2]}`" alt="Tour picture" /> -->
          <img class="cta__img cta__img--1" :src="`http://localhost:3000/img/tours/${tour.images[1]}`"
            alt="Tour picture" />
          <img class="cta__img cta__img--2" :src="`http://localhost:3000/img/tours/${tour.images[2]}`"
            alt="Tour picture" />
          <div class="cta__content">
            <h2 class="heading-secondary">What are you waiting for?</h2>
            <p class="cta__text">
              {{ tour.duration }} days. 1 adventure. Infinite memories. Make it yours today!
            </p>
            <button class="btn btn--green span-all-rows">Book tour now!</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import OverviewBox from '../OverviewBox.vue'
import ReviewCard from '../ReviewCard.vue'
import 'mapbox-gl/dist/mapbox-gl.css';
import MapBoxMap from '../MapBoxMap.vue'

const props = defineProps({ slug: String })

const tour = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/tours/${props.slug}`);
    tour.value = res.data.tour;
    document.title = `Natours | ${tour.value.name}`
  } catch (err) {
    error.value = 'Failed to load tour details.'
  } finally {
    loading.value = false
  }
})

const nextDate = computed(() => {
  if (!tour.value || !tour.value.startDates || !tour.value.startDates[0]) return ''
  return new Date(tour.value.startDates[0]).toLocaleString('en-us', {
    month: 'long',
    year: 'numeric'
  })
})

const descriptionParagraphs = computed(() =>
  tour.value && tour.value.description ? tour.value.description.split('\n') : []
)
</script>

<style lang="scss">
@use "@/assets/styles/mixins" as *;

.section-header {
  position: relative;
  height: 52vw;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
  -webkit-clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);

  @include respond(md) {
    height: 38vw;
  }
}

.header__hero {
  height: 100%;

  &-img {
    -o-object-fit: cover;
    object-fit: cover;
    height: 100%;
    width: 100%;
    -o-object-position: 50% 25%;
    object-position: 50% 25%;
  }

  &-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: -webkit-gradient(linear, left top, right bottom, from(#7dd56f), to(#28b487));
    background-image: linear-gradient(to right bottom, #7dd56f, #28b487);
    opacity: 0.85;
  }
}

.heading-box {
  position: absolute;
  top: 3rem;
  width: 100%;
  height: 100%;

  @include respond(xl) {
    bottom: 13vw;
    left: 50%;
    top: 35%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: unset;
    height: unset;

  }

  &__group {
    color: #f7f7f7;
    margin-top: 3rem;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
  }

  &__detail {
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    text-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);

    svg {
      margin-right: 0.8rem;
    }

    &:not(:last-child) {
      margin-right: 4rem;
    }
  }

  &__icon {
    height: 2rem;
    width: 2rem;
    fill: currentColor;
    -webkit-filter: drop-shadow(0 0.75rem 0.5rem rgba(0, 0, 0, 0.25));
    filter: drop-shadow(0 0.75rem 0.5rem rgba(0, 0, 0, 0.25));
  }
}

.section-description {
  background-color: #fcfcfc;
  margin-top: calc(0px - var(--section-rotate));
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  flex-direction: column;

  @include respond(md) {
    flex-direction: row;
  }

  >* {
    padding: 0 8vw;
    padding-top: 14vw;
    padding-bottom: calc(1vw + var(--section-rotate));
    -webkit-box-flex: 0;
    -ms-flex: 0 0 50%;
    flex: 0 0 50%;
  }
}

.description-box {
  .description {
    margin-right: 5rem;
  }

  .description__text {
    font-size: 1.7rem;

    &:not(:last-child) {
      margin-bottom: 2rem;
    }
  }
}

.section-pictures {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  clip-path: polygon(0 var(--section-rotate), 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
  -webkit-clip-path: polygon(0 var(--section-rotate), 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
  margin-top: calc(0px - var(--section-rotate));
  position: relative;
  z-index: 1000;
}

.picture-box__img {
  display: block;
  width: 100%;
  height: 110%;
  -o-object-fit: cover;
  object-fit: cover;

  &--1 {
    padding-top: 15%;
  }

  &--2 {
    padding-bottom: 15%;
  }

  &--3 {
    padding-bottom: 27%;
  }
}

.section-map {
  position: relative;
  height: 65rem;
  margin-top: calc(0px - var(--section-rotate));
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.marker {
  background-image: url('../img/pin.png');
  background-size: cover;
  width: 32px;
  height: 40px;
  cursor: pointer;
}

.mapboxgl-popup {
  max-width: 25rem;
}

.mapboxgl-popup-content {
  text-align: center;
  font-family: 'Lato', sans-serif;
  padding: 1.5rem !important;
  font-size: 1.4rem;
  -webkit-box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15) !important;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15) !important;
}

.section-reviews {
  margin-top: calc(0px - var(--section-rotate));
  padding: calc(5rem + var(--section-rotate)) 0;
  position: relative;
  z-index: 1000;
  background: -webkit-gradient(linear, left top, right bottom, from(#7dd56f), to(#28b487));
  background: linear-gradient(to right bottom, #7dd56f, #28b487);
  clip-path: polygon(0 var(--section-rotate), 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
  -webkit-clip-path: polygon(0 var(--section-rotate), 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
}

.reviews {
  padding: 5rem 0;
  display: grid;
  grid-column-gap: 6rem;
  grid-auto-flow: column;
  overflow-x: scroll;
  -ms-scroll-snap-type: x mandatory;
  scroll-snap-type: x mandatory;

  &:before,
  &:after {
    content: '';
    width: 2rem;
  }
}

.reviews__card {
  width: 30rem;
  padding: 4rem;
  background-color: #f7f7f7;
  border-radius: 3px;
  -webkit-box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.15);
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.15);
  scroll-snap-align: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.reviews__avatar {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  margin-bottom: 2rem;
}

.reviews__avatar-img {
  height: 4.5rem;
  border-radius: 50%;
  margin-right: 1.5rem;
}

.reviews__user {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.reviews__text {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-style: italic;
  font-weight: 400;
}

.reviews__rating {
  margin-top: auto;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.reviews__star {
  height: 2rem;
  width: 2rem;
  margin-right: 1px;

  &--active {
    fill: #55c57a;
  }

  &--inactive {
    fill: #bbb;
  }
}

.section-cta {
  margin-top: calc(0px - var(--section-rotate));
  padding: 3rem;
  padding-bottom: 11rem;
  padding-top: calc(15rem + var(--section-rotate));
  background-color: #f7f7f7;
}

.cta {
  position: relative;
  max-width: 105rem;
  margin: 0 auto;
  overflow: hidden;
  background-color: #fff;
  padding: 9rem 5rem 9rem 21rem;
  border-radius: 2rem;
  -webkit-box-shadow: 0 3rem 8rem 0.5rem rgba(0, 0, 0, 0.15);
  box-shadow: 0 3rem 8rem 0.5rem rgba(0, 0, 0, 0.15);

  &__img {
    height: 15rem;
    width: 15rem;
    position: absolute;
    left: 0;
    top: 50%;
    border-radius: 50%;
    -webkit-box-shadow: 1rem 0.5rem 3rem rgba(0, 0, 0, 0.15);
    box-shadow: 1rem 0.5rem 3rem rgba(0, 0, 0, 0.15);

    &--logo {
      padding: 2rem;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      background: -webkit-gradient(linear, left top, right bottom, from(#7dd56f), to(#28b487));
      background: linear-gradient(to right bottom, #7dd56f, #28b487);
      z-index: 10;
      -webkit-transform: translate(-35%, -50%);
      transform: translate(-35%, -50%);

      img {
        width: 100%;
      }
    }

    &--1 {
      -webkit-transform: translate(-10%, -50%) scale(0.97);
      transform: translate(-10%, -50%) scale(0.97);
      z-index: 9;
    }

    &--2 {
      -webkit-transform: translate(15%, -50%) scale(0.94);
      transform: translate(15%, -50%) scale(0.94);
      z-index: 8;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 2rem;

    @include respond(md) {
      display: grid;
      grid-template-rows: auto auto;
      grid-template-columns: 1fr;
      grid-gap: 0.7rem;
      grid-auto-flow: column;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
    }
  }

  &__text {
    font-size: 1.9rem;
    font-weight: 400;
  }
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 1.25rem;
}

.error {
  padding: 2rem;
  text-align: center;
  color: #c00;
  font-size: 1.25rem;
}
</style>

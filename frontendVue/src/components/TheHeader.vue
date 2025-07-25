<template>
  <header class="header">
    <div class="header__logo">
      <img src="/img/logo-white.png" alt="Natours logo" />
    </div>
    <nav class="nav">
      <router-link to="/" class="nav__el">All tours</router-link>
      <template v-if="auth.isLoggedIn && auth.user">
        <router-link to="/users/me" class="nav__el">
          <!-- <img :src="`/img/users/${user.photo}`" :alt="`Photo of ${user.name}`" class="nav__user-img" /> -->
          <img :src="`http://localhost:3000/img/users/${auth.user.photo}`" :alt="`Photo of ${auth.user.name}`"
            class="nav__user-img" />
          <span>{{ auth.user.name.split(' ')[0] }}</span>
        </router-link>

        <button class="nav__el nav__el--logout" @click="handleLogout"> Log out</button>
      </template>

      <template v-else>
        <router-link to="/users/login" class="nav__el">Log in</router-link>
        <router-link to="/users/signup" class="nav__el nav__el--cta">Sign up</router-link>
      </template>
    </nav>
  </header>
</template>

<script setup>
import useAuthStore from '../stores/auth';
import useAlertStore from '../stores/alerts';
import { useRouter } from 'vue-router';
import api from '@/api';

const auth = useAuthStore();
const alertStore = useAlertStore();
const router = useRouter();

async function handleLogout() {
  try {
    await api.get('/users/logout') // or POST if your API uses POST
    auth.logout();
    alertStore.showAlert('success', 'Logout successful!')
    router.push('/tours')
  } catch (err) {
    alertStore.showAlert('error', err.response?.data?.message || 'Logout failed.');
  }
}
</script>


<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.header {
  background-color: #444;
  padding: 0 1rem;
  height: 8rem;
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include respond(sm) {
    padding: 2rem;
    gap: 1.5rem;
  }

  @include respond(lg) {
    padding: 0 5rem;
  }

  &__logo {
    img {
      height: 3rem;
    }

    @include respond(md) {
      height: 3.5rem;
    }
  }

  &__hero {
    height: 100%;

    &-img {
      object-fit: cover;
      object-position: 50% 25%;
      height: 100%;
      width: 100%;
    }

    &-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(to right bottom, #7dd56f, #28b487);
      opacity: 0.85;
    }
  }
}

.section-header {
  position: relative;
  height: 38vw;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--section-rotate)), 0 100%);
}

.nav {
  display: flex;
  align-items: center;

  &__el {
    color: #f7f7f7;
    text-transform: uppercase;
    font-size: 1.6rem;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    font-weight: 400;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;

    &:hover,
    &:active {
      transform: translateY(-2px);
      text-shadow: 0 0.7rem 1rem black;
    }

    &:not(:last-child) {
      margin-right: 3rem;
    }

    &:focus {
      outline: none;
    }

    &--cta {
      padding: 0.8rem 2.6rem;
      border-radius: 10rem;
      border: 1px solid currentColor !important;
      transition: all 0.3s;

      &:hover {
        background-color: #f7f7f7;
        color: #777;
        text-shadow: none;
        border-color: #f7f7f7;
      }

      @include respond(md) {
        padding: 1rem 3rem;
      }
    }
  }

  &__search {
    display: flex;
    align-items: center;

    @media only screen and (max-width: 37.5em) {
      order: -1;
      margin-bottom: 1.2rem;
    }

    &-btn {
      background: none;
      border: none;
      margin-right: 0.8rem;
      transform: translateY(1px);

      svg {
        height: 2rem;
        width: 2rem;
        fill: #f7f7f7;
      }
    }

    &-input {
      font-family: inherit;
      font-weight: inherit;
      text-transform: uppercase;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #f7f7f7;
      padding-bottom: 3px;
      border-bottom: 1px solid #999;
      width: 18rem;
      transition: all 0.3s;

      &::placeholder {
        color: #999;
      }

      &:focus {
        outline: none;
        width: 25rem;
        border-bottom: 1px solid currentColor;
      }
    }
  }

  &__user-img {
    height: 3.5rem;
    width: 3.5rem;
    border-radius: 50%;
    margin-right: 1rem;
  }
}
</style>

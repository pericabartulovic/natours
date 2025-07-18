<template>
  <main class="main">
    <div class="form-container">
      <h2 class="heading-secondary ma-bt-lg">Create your account</h2>
      <form class="form form--signup" @submit.prevent="onSubmit">
        <div class="form__group">
          <label class="form__label" for="name">Name</label>
          <input class="form__input" v-model="name" type="text" required />
        </div>

        <div class="form__group">
          <label class="form__label" for="email">Email</label>
          <input class="form__input" v-model="email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="form__group">
          <label class="form__label" for="password">Password</label>
          <input class="form__input" v-model="password" type="password" required minlength="8" />
        </div>

        <div class="form__group">
          <label class="form__label" for="passwordConfirm">Confirm Password</label>
          <input class="form__input" v-model="passwordConfirm" type="password" required minlength="8" />
        </div>

        <button class="btn btn--green" type="submit" :disabled="loading">
          {{ loading ? 'Signing up...' : 'Sign up' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import useAuthStore from '@/stores/auth'
import useAlertStore from '../../stores/alerts';


const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const router = useRouter();
const auth = useAuthStore();
const alertStore = useAlertStore();

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await api.post('/users/signup', {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    })
    auth.isLoggedIn = true
    auth.user = res.data.user
    alertStore.showAlert('success', 'Signup successful!');
    setTimeout(() => router.push('/tours'), 1000);
  } catch (err) {
    alertStore.showAlert('error', err.response?.data?.message || 'Signup failed. Check your data and try again.')
  } finally {
    loading.value = false
  }
}
</script>

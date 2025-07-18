<template>
  <main class="main">    
    <div class="form-container">
      <h2 class="heading-secondary ma-bt-lg">Log into your account</h2>
      <form class="form form--login" @submit.prevent="onSubmit">
        <div class="form__group">
          <label class="form__label" for="email">Email address</label>
          <input id="email" class="form__input" type="email" placeholder="you@example.com" v-model="email" required />
        </div>
        <div class="form__group ma-bt-md">
          <label class="form__label" for="password">Password</label>
          <input id="password" class="form__input" type="password" placeholder="••••••••" v-model="password" required
            minlength="8" />
        </div>
        <div class="form__group">
          <button class="btn btn--green" type="submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
        <!-- <div v-if="error" class="form__error">{{ error }}</div> -->
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import useAuthStore from '../../stores/auth';
import useAlertStore from '../../stores/alerts';
import api from '../../api';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const auth = useAuthStore();
const alertStore = useAlertStore();


const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/users/login', {
      email: email.value,
      password: password.value
    })
    auth.isLoggedIn = true
    auth.user = res.data.user
    
    alertStore.showAlert('success', 'Login successful!');
    
    // Rredirect to home page
    setTimeout(() => router.push('/tours'), 1000)
    
  } catch (err) {
    alertStore.showAlert('error',err.response?.data?.message || 'Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

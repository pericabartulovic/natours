<template>
  <main class="main">
    <div class="form-container">
      <h2 class="heading-secondary ma-bt-lg">Reset password</h2>
      <form class="form form--reset" @submit.prevent="onSubmit">
        <div class="form__group ma-bt-md">
          <label class="form__label" for="password">Password</label>
          <input id="password" class="form__input" type="password" placeholder="••••••••" v-model="password" required
            minlength="8" />
        </div>
        <div class="form__group ma-bt-xl">
          <label class="form__label" for="passwordConfirm">Confirm Password</label>
          <input class="form__input" v-model="passwordConfirm" type="password" placeholder="••••••••" required
            minlength="8" />
        </div>
        <div class="form__group form__group--actions">
          <button class="btn btn--green" type="submit" :disabled="loading">
            {{ loading ? 'Reseting...' : 'Reset' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import useAuthStore from '../../../stores/auth';
import useAlertStore from '../../../stores/alerts';
import api from '../../../api';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router'

const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const alertStore = useAlertStore();


const onSubmit = async () => {
  loading.value = true
  try {
    const token = route.params.token
    const res = await api.patch(`/users/resetPassword/${token}`, {
      password: password.value,
      passwordConfirm: passwordConfirm.value
    })
    auth.isLoggedIn = true
    auth.user = res.data.user

    alertStore.showAlert('success', 'Login successful!');

    // Rredirect to home page
    setTimeout(() => router.push('/tours'), 1000)

  } catch (err) {
    alertStore.showAlert('error', err.response?.data?.message || 'Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

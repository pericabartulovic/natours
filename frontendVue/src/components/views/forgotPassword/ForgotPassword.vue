<template>
  <main class="main">
    <div class="form-container">
      <h2 class="heading-secondary ma-bt-lg">Forgot your password?</h2>
      <form class="form form--login" @submit.prevent="onSubmit">
        <div class="form__group ma-bt-xl">
          <label class="form__label" for="email">Email address</label>
          <input id="email" class="form__input" type="email" placeholder="you@example.com" v-model="email" required />
        </div>
        <div class="form__group">
          <button class="btn btn--green" type="submit">
            Send reset link
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import useAlertStore from '../../../stores/alerts';
import api from '../../../api';

const email = ref('');
const alertStore = useAlertStore();


const onSubmit = async () => {
  try {
    await api.post('/users/forgotPassword', {
      email: email.value,
    })
    alertStore.showAlert('success', 'Check your email!');
  } catch (err) {
    alertStore.showAlert('error', err.response?.data?.message || 'There was an error sending the email. Please, try again later.')
  }
}
</script>

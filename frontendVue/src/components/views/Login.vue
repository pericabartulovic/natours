<template>
  <main class="main">
    <GlobalAlert v-if="alert" :message="alert.message" :type="alert.type" />
    
    <div class="login-form">
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
import { ref } from 'vue'
import useAuthStore from '@/stores/auth'
import api from '../../api'
import { useRouter } from 'vue-router'
import GlobalAlert from '@/components/GlobalAlert.vue' 

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const auth = useAuthStore()
const alert = ref(null)

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
    
    alert.value = { type: 'success', message: 'Login successful!' }
    
    // Rredirect to home page
    setTimeout(() => router.push('/tours'), 1000)
    
  } catch (err) {
    alert.value = { type: 'error', message: err.response?.data?.message || 'Login failed. Please try again.' } // ✅ Correct
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  margin: 0 auto;
  max-width: 55rem;
  background-color: #fff;
  box-shadow: 0 2.5rem 8rem 2rem rgba(0, 0, 0, 0.06);
  -webkit-box-shadow: 0 2.5rem 8rem 2rem rgba(0, 0, 0, 0.06);
  padding: 5rem 7rem;
  border-radius: 5px;
}

.form__input {
  display: block;
  font-family: inherit;
  font-size: 1.5rem;
  color: inherit;
  padding: 1.25rem 1.75rem;
  border: none;
  width: 100%;
  background-color: #fff;
  background-color: #f2f2f2;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  -webkit-transition: all 0.3s;
  border-radius: 4px;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;

  &:focus {
    outline: none;
    border-bottom: 3px solid #55c57a;
  }

  &:focus:invalid {
    border-bottom: 3px solid #ff7730;
  }

  &::-webkit-input-placeholder {
    color: #bbb;
  }
}

.form__group {
  &:not(:last-child) {
    margin-bottom: 2.5rem;
  }
}

.form__label {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.form__photo-upload {
  display: flex;
  display: -webkit-box;
  display: -ms-flexbox;
  align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  font-size: 1.6rem;
}

.form__user-photo {
  height: 7.5rem;
  width: 7.5rem;
  border-radius: 50%;
  margin-right: 2rem;
}

.form__upload {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;

  &:focus+label {
    outline: 3px solid #55c57a;
    outline-offset: 3px;
  }

  &+label {
    color: #55c57a;
    display: inline-block;
    text-decoration: none;
    border-bottom: 1px solid #55c57a;
    padding: 3px;
    transition: all 0.2s;
    -webkit-transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background-color: #55c57a;
      color: #fff;
      box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15);
      -webkit-box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
      -webkit-transform: translateY(-2px);
    }
  }
}

.form__error {
  color: #c00;
  margin-top: 1rem;
  text-align: center;
}
</style>

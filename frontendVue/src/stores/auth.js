import { defineStore } from 'pinia'
import api from '../api' // Your API helper

const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null,
    checked: false // To avoid double API calls -> see routes/index.js
  }),
  actions: {
    async checkAuth() {
      try {
        const res = await api.get('/users/me')
        this.isLoggedIn = true
        this.user = res.data.user
      } catch {
        this.isLoggedIn = false
        this.user = null
      } finally {
        this.checked = true
      }
    },
    logout() {
      this.isLoggedIn = false
      this.user = null
    }
  }
})

export default useAuthStore;

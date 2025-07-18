import { defineStore } from 'pinia'
import { ref } from 'vue'

const useAlertStore = defineStore('alert', () => {
  const alert = ref(null)

  function showAlert(type, message, duration = 5000) {
    alert.value = { type, message }
    setTimeout(() => {
      alert.value = null
    }, duration)
  }

  return {
    alert,
    showAlert
  }
});

export default useAlertStore;

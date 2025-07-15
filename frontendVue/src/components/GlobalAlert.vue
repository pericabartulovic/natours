<template>
  <Transition name="fade">
    <div v-if="visible" :class="['alert', `alert--${type}`]">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success'
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const visible = ref(false)
let timeout

// Watch for new message updates
watch(
  () => props.message,
  (newMessage) => {
    if (!newMessage) return
    visible.value = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      visible.value = false
    }, props.duration)
  },
  { immediate: true }
)

onUnmounted(() => clearTimeout(timeout))
</script>

<style scoped>
.alert {
  position: fixed;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1.5rem 3rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.6rem;
  z-index: 9999;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
}

.alert--success {
  background-color: #28b485;
}

.alert--error {
  background-color: #ff4c60;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

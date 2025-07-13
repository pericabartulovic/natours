<template>
  <div class="overview-box__detail">
    <svg class="overview-box__icon">
      <use :xlink:href="`/img/icons.svg#icon-${icon}`"></use>
    </svg>
    <span class="overview-box__label">{{ label }}</span>
    <span class="overview-box__text">{{ text }}</span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  text: { type: String, required: true },
  icon: { type: String, required: true }
})
</script>

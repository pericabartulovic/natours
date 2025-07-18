<template>
  <GlobalAlert v-if="alert" :type="alert.type" :message="alert.message" />
  <Header />
  <router-view />
  <Footer />
</template>

<script setup>
import Header from './components/TheHeader.vue';
import Footer from './components/TheFooter.vue';
import GlobalAlert from './components/GlobalAlert.vue';
import useAlertStore from './stores/alerts'
import { storeToRefs } from 'pinia'

const { alert } = storeToRefs(useAlertStore())
</script>
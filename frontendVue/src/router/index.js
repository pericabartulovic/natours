import { createRouter, createWebHistory } from 'vue-router'
import Overview from '../components/views/Overview.vue'
import TourDetails from '../components/views/TourDetails.vue'
import Login from '../components/views/Login.vue'
import Signup from '../components/views/Signup.vue'
import Account from '../components/views/Account.vue'

const routes = [
  { path: '/', component: Overview },
  { path: '/tour/:slug', component: TourDetails, props: true },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/me', component: Account }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

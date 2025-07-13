import { createRouter, createWebHistory } from 'vue-router'
import Overview from '../components/views/Overview.vue'
import TourDetails from '../components/views/TourDetails.vue'
import Login from '../components/views/Login.vue'
import Signup from '../components/views/Signup.vue'
import Account from '../components/views/Account.vue'

const routes = [
  { path: '/tours', component: Overview },
  {
    path: '/tour/:slug',
    component: TourDetails,
    props: true,    //props: true in the route definition tells Vue Router to pass route params as props to the component.
    meta: { title: 'Tour Details' }
  },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/me', component: Account },
  { path: '/:pathMatch(.*)*', redirect: '/tours' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Set document title after each navigation
/* eslint-env browser */
router.afterEach((to, from) => {
  if (typeof document !== 'undefined') {
    if (to.meta.title) {
      document.title = `Natours | ${to.meta.title}`
    } else {
      document.title = 'Natours | Exciting tours for adventurous people'
    }
  }
})

export default router

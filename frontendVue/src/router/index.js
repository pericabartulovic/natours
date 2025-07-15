import { createRouter, createWebHistory } from 'vue-router'
// import useAuthStore from '@/stores/auth'

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
    meta: { title: 'Tour Details', scrollToTop: true }
  },
  { path: '/users/login', component: Login },
  { path: '/users/signup', component: Signup },
  { path: '/users/me', component: Account },
  { path: '/:pathMatch(.*)*', redirect: '/tours' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// router.beforeEach(async (to, from, next) => {
//   const auth = useAuthStore()
//   // Wait for auth check if not done yet
//   if (!auth.checked) await auth.checkAuth()

//   const publicPages = ['/users/login', '/users/signup', '/tours']
//   const authRequired = !publicPages.includes(to.path)

//   if (authRequired && !auth.isLoggedIn) {
//     return next('/users/login')
//   }
//   next()
// })

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

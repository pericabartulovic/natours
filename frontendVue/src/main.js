import { createApp } from 'vue'
import './assets/styles/main.scss'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'mapbox-gl/dist/mapbox-gl.css';


const app = createApp(App)
app.use(createPinia())
app.use(router)

app.mount('#app')


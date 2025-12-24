import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../features/auth/views/LoginView.vue'
import SignupView from '../features/auth/views/SignupView.vue'

const routes = [
    { path: '/login', component: LoginView },
    { path: '/signup', component: SignupView },
    { path: '/', redirect: '/login' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
